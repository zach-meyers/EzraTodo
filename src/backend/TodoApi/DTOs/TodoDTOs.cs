namespace TodoApi.DTOs;

public record CreateTodoRequest(
    string Name,
    DateTime DueDate,
    string? Notes,
    List<string>? Tags,
    string? Location
);

public record UpdateTodoRequest(
    int Id,
    string Name,
    DateTime DueDate,
    string? Notes,
    List<string>? Tags,
    string? Location
);

public record TodoResponse(
    int Id,
    int UserId,
    string Name,
    DateTime DueDate,
    string? Notes,
    List<string> Tags,
    string? Location,
    DateTime CreatedDate
);
