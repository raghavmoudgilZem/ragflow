using System.Text.Json;
using Document.Application.Interfaces.Persistence;
using MassTransit;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Ragflow.Identity.Application.Interfaces;
using Ragflow.Identity.Domain.Common.Constants;
using Ragflow.Identity.Infrastructure.Messaging;

namespace Ragflow.Identity.Infrastructure.BackgroundServices;

public sealed class OutboxPublisherBackgroundService : BackgroundService
{


    private readonly int _batchSize;
    private readonly TimeSpan _pollingInterval;

    private readonly IServiceScopeFactory _scopeFactory;

    private readonly ILogger<OutboxPublisherBackgroundService> _logger;

    public OutboxPublisherBackgroundService(
        IServiceScopeFactory scopeFactory,
        ILogger<OutboxPublisherBackgroundService> logger, IOptions<OutboxSettings> options)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;

        _batchSize = options.Value.BatchSize;
        _pollingInterval = TimeSpan.FromSeconds(options.Value.PollingInterval);
    }

    protected override async Task ExecuteAsync(
        CancellationToken stoppingToken)
    {
        _logger.LogInformation(
            "Outbox Publisher Background Service started.'{datetime}'",
            DateTime.UtcNow);



        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await PublishPendingMessagesAsync(
                    stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "Unexpected error while processing outbox messages.");
            }

            await Task.Delay(
                _pollingInterval,
                stoppingToken);
        }
    }

    private async Task PublishPendingMessagesAsync(
        CancellationToken cancellationToken)
    {
        using var scope =
            _scopeFactory.CreateScope();

        var outboxRepository =
            scope.ServiceProvider
                .GetRequiredService<IOutboxRepository>();

        var publishEndpoint =
            scope.ServiceProvider
                .GetRequiredService<IPublishEndpoint>();

        var unitOfWork =
            scope.ServiceProvider
                .GetRequiredService<IUnitOfWork>();

        var messages =
            await outboxRepository.GetPendingAsync(
                _batchSize,
                cancellationToken);
        _logger.LogInformation(
                   "messages.Count: {Count}", messages.Count);
        if (messages.Count == 0)
            return;

        foreach (var message in messages)
        {
            try
            {
                //-----------------------------------------
                // Mark Processing
                //-----------------------------------------

                message.Status = OutboxStatus.Processing;

                message.LastAttemptOnUtc = DateTime.UtcNow;

                await unitOfWork.CommitAsync(
                    cancellationToken);

                //-----------------------------------------
                // Resolve Event Type
                //-----------------------------------------

                var eventType =
                    EventTypeResolver.Resolve(
                        message.EventType);

                if (eventType is null)
                {
                    throw new Exception(
                        $"Unable to resolve event type '{message.EventType}'.");
                }

                //-----------------------------------------
                // Deserialize Event
                //-----------------------------------------

                var integrationEvent =
                    JsonSerializer.Deserialize(
                        message.Payload,
                        eventType);

                if (integrationEvent is null)
                {
                    throw new Exception(
                        "Failed to deserialize integration event.");
                }

                //-----------------------------------------
                // Publish Event
                //-----------------------------------------

                await publishEndpoint.Publish(
                    integrationEvent,
                    eventType,
                    cancellationToken);

                //-----------------------------------------
                // Update Success
                //-----------------------------------------

                message.Status =
                    OutboxStatus.Processed;

                message.ProcessedOnUtc =
                    DateTime.UtcNow;

                message.ErrorMessage = null;

                await unitOfWork.CommitAsync(
                    cancellationToken);

                _logger.LogInformation(
                    "Outbox message {MessageId} published successfully.",
                    message.MessageId);
            }
            catch (Exception ex)
            {
                //-----------------------------------------
                // Update Failure
                //-----------------------------------------

                message.Status =
                    OutboxStatus.Pending;

                message.RetryCount++;

                message.LastAttemptOnUtc =
                    DateTime.UtcNow;

                message.ErrorMessage =
                    ex.Message;

                await unitOfWork.CommitAsync(
                    cancellationToken);

                _logger.LogError(
                    ex,
                    "Failed to publish outbox message {MessageId}. RetryCount={RetryCount}",
                    message.MessageId,
                    message.RetryCount);
            }
        }
    }
}