using MongoDB.Driver;
using RAGFlow.ApiGateway.Models;
using RAGFlow.ApiGateway.Services;

namespace RAGFlow.ApiGateway.Workers
{
    public class AuditLogWorkerService : BackgroundService
    {
        private readonly IAuditLogQueue _auditQueue;
        private readonly ILogger<AuditLogWorkerService> _logger;
        private readonly IMongoCollection<AuditLogEvent> _logCollection;

        public AuditLogWorkerService(IAuditLogQueue auditQueue, ILogger<AuditLogWorkerService> logger, IConfiguration config)
        {
            _auditQueue = auditQueue;
            _logger = logger;

            var client = new MongoClient(config["MongoDbSettings:ConnectionString"]);
            var database = client.GetDatabase(config["MongoDbSettings:DatabaseName"]);
            _logCollection = database.GetCollection<AuditLogEvent>(config["MongoDbSettings:CollectionName"]);
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("Audit Log Worker started. Listening for immediate API traffic...");

            try
            {
                // The loop waits silently. The MILLISECOND a log drops in the queue, it triggers.
                await foreach (var logEvent in _auditQueue.ReadAllAsync(stoppingToken))
                {
                    await FlushSingleLogAsync(logEvent, stoppingToken);
                }
            }
            catch (OperationCanceledException ex)
            {
                // App is shutting down gracefully
                _logger.LogInformation(ex, "Audit Log Worker shutting down...");
            }
        }

        private async Task FlushSingleLogAsync(AuditLogEvent logEvent, CancellationToken cancellationToken)
        {
            try
            {
                // Write the single log to MongoDB instantly
                await _logCollection.InsertOneAsync(logEvent, cancellationToken: cancellationToken);
                _logger.LogInformation("Instantly saved audit log for TraceId: {TraceId}", logEvent.TraceId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to write audit log to MongoDB for TraceId: {TraceId}", logEvent.TraceId);
            }
        }
    }
}