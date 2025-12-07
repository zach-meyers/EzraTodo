namespace TodoApi.Models;

public class ErrorResponse
{
    public string TraceId { get; set; } = string.Empty;
    public int StatusCode { get; set; }
    public string ErrorCode { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string? Details { get; set; }
    public Dictionary<string, string[]>? ValidationErrors { get; set; }
    public string Timestamp { get; set; } = DateTime.UtcNow.ToString("o");
}
