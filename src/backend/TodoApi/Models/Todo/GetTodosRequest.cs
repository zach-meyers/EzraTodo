using System.Text.Json.Serialization;

namespace TodoApi.Models.Todo;

public record GetTodosRequest(
    [property: JsonPropertyName("dueDateFrom")]
    DateTime? DueDateFrom,
    [property: JsonPropertyName("dueDateTo")]
    DateTime? DueDateTo,
    [property: JsonPropertyName("createdDateFrom")]
    DateTime? CreatedDateFrom,
    [property: JsonPropertyName("createdDateTo")]
    DateTime? CreatedDateTo,
    [property: JsonPropertyName("tag")]
    string? Tag
);