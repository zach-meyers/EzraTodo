using TodoApi.Data.Entities;
using TodoApi.Services;

namespace TodoApi.Data;

public static class DbSeeder
{
    public static void SeedDevelopmentData(AppDbContext context, IAuthService authService)
    {
        // Only seed if database is empty
        if (context.Users.Any())
            return;

        // Create test user
        var testUser = new User
        {
            Email = "test@example.com",
            PasswordHash = authService.HashPassword("Test123!"),
            CreatedAt = DateTime.UtcNow
        };
        context.Users.Add(testUser);
        context.SaveChanges();

        // Create sample todos
        var todo1 = new TodoItem
        {
            UserId = testUser.Id,
            Name = "Sample Todo 1",
            DueDate = DateTime.UtcNow.AddDays(7),
            Notes = "This is a sample todo item",
            Location = "Office",
            CreatedDate = DateTime.UtcNow
        };

        var todo2 = new TodoItem
        {
            UserId = testUser.Id,
            Name = "Sample Todo 2",
            DueDate = DateTime.UtcNow.AddDays(14),
            Notes = "Another sample todo",
            CreatedDate = DateTime.UtcNow
        };

        context.TodoItems.AddRange(todo1, todo2);
        context.SaveChanges();

        // Create sample tags for todos
        var tags = new[]
        {
            new TodoItemTag { TodoItemId = todo1.Id, Tag = "work" },
            new TodoItemTag { TodoItemId = todo1.Id, Tag = "urgent" },
            new TodoItemTag { TodoItemId = todo2.Id, Tag = "personal" }
        };
        context.TodoItemTags.AddRange(tags);
        context.SaveChanges();
    }
}
