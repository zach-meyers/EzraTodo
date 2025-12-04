namespace TodoApi.Data.Entities;

public class TodoItemTag
{
    public int Id { get; set; }
    public int TodoItemId { get; set; }
    public required string Tag { get; set; }

    public TodoItem? TodoItem { get; set; }
}
