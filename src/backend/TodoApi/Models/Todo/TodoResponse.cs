namespace TodoApi.Models.Todo;

public record TodoResponse(
    int Id,
    int UserId,
    string Name,
    DateTime DueDate,
    string? Notes,
    IList<string> Tags,
    string? Location,
    DateTime CreatedDate
);