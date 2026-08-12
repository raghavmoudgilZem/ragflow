using System.Threading.Channels;
using RAGFlow.ApiGateway.Models;

namespace RAGFlow.ApiGateway.Services
{
    public interface IAuditLogQueue
    {
        bool TryEnqueue(AuditLogEvent logEvent);
        IAsyncEnumerable<AuditLogEvent> ReadAllAsync(CancellationToken cancellationToken);
        ValueTask WriteAsync(AuditLogEvent logEvent, CancellationToken cancellationToken = default);
    }

    public class AuditLogQueue : IAuditLogQueue
    {
        private readonly Channel<AuditLogEvent> _channel;

        public AuditLogQueue()
        {
            // Bounded to 10,000 logs. If DB fails, drops oldest logs to save RAM.
            var options = new BoundedChannelOptions(10000)
            {
                FullMode = BoundedChannelFullMode.DropOldest 
            };
            _channel = Channel.CreateBounded<AuditLogEvent>(options);
        }

        public bool TryEnqueue(AuditLogEvent logEvent)
        {
            return _channel.Writer.TryWrite(logEvent);
        }

        public IAsyncEnumerable<AuditLogEvent> ReadAllAsync(CancellationToken cancellationToken)
        {
            return _channel.Reader.ReadAllAsync(cancellationToken);
        }

        public async ValueTask WriteAsync(AuditLogEvent logEvent, CancellationToken cancellationToken = default)
        {
            await _channel.Writer.WriteAsync(logEvent, cancellationToken);
        }
    }
}