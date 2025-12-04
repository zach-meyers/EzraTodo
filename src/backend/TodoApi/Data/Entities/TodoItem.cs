namespace TodoApi.Data.Entities;

public class TodoItem
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public required string Name { get; set; }
    public DateTime DueDate { get; set; }
    public string? Notes { get; set; }
    public string? Location { get; set; }
    public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

    public User? User { get; set; }
    public ICollection<TodoItemTag> TodoItemTags { get; set; } = new List<TodoItemTag>();
}
