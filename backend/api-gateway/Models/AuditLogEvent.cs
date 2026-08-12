using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace RAGFlow.ApiGateway.Models
{
    public class AuditLogEvent
    {
        [BsonId]
        [BsonGuidRepresentation(GuidRepresentation.Standard)]
        public Guid Id { get; set; } = Guid.NewGuid();
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
        public string? Level { get; set; } 
        public string? TraceId { get; set; }
        public string? SpanId { get; set; } 
        
        public SystemContext? SystemContext { get; set; }
        public UserContext? UserContext { get; set; }
        public RequestDetails? RequestDetails { get; set; }
        public ResponseDetails? ResponseDetails { get; set; }
    }

    public class SystemContext
    {
        public string? ServiceName { get; set; }
        public string? Environment { get; set; }
        public string? HostName { get; set; }
    }

    public class UserContext
    {
        public string? UserId { get; set; }
        public string? TenantId { get; set; }
        public string? SessionId { get; set; }
        public string? ClientIp { get; set; }
        public string? UserAgent { get; set; } 
    }

    public class RequestDetails
    {
        public string? Method { get; set; }
        public string? Path { get; set; }
        public string? QueryString { get; set; }
        public string? TargetService { get; set; } 
    }

    public class ResponseDetails
    {
        public int StatusCode { get; set; }
        public long DurationMs { get; set; }
        public string? ErrorType { get; set; }     
        public string? ErrorMessage { get; set; }  
    }
}