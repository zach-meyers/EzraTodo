namespace TodoApi.Exceptions;

public class ValidationException : AppException
{
    public Dictionary<string, string[]> ValidationErrors { get; }

    public ValidationException(Dictionary<string, string[]> errors)
        : base("Validation failed", 400, "VALIDATION_ERROR")
    {
        ValidationErrors = errors;
    }
}
