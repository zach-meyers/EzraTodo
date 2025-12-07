using Microsoft.EntityFrameworkCore;
using TodoApi.Data;
using TodoApi.Data.Entities;
using TodoApi.Exceptions;
using TodoApi.Extensions;
using TodoApi.Models.Todo;

namespace TodoApi.Services;

public class TodoService : ITodoService
{
    private readonly ILogger<TodoService> _logger;
    private readonly AppDbContext _dbContext;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public TodoService(ILogger<TodoService> logger, AppDbContext dbContext, IHttpContextAccessor httpContextAccessor)
    {
        _logger = logger;
        _dbContext = dbContext;
        _httpContextAccessor = httpContextAccessor;
    }

    public async Task<IList<TodoResponse>> GetTodos()
    {
        var userId = _httpContextAccessor.GetUserId();

        var todos = await _dbContext.TodoItems
            .Include(t => t.TodoItemTags)
            .Where(t => t.UserId == userId)
            .ToListAsync();

        return todos.Select(t => new TodoResponse(
            t.Id,
            t.UserId,
            t.Name,
            t.DueDate,
            t.Notes,
            t.TodoItemTags.Select(tt => tt.Tag).ToList(),
            t.Location,
            t.CreatedDate
        )).ToList();
    }

    public async Task<TodoResponse> GetTodo(int id)
    {
        var userId = _httpContextAccessor.GetUserId();

        var todo = await _dbContext.TodoItems
            .Include(t => t.TodoItemTags)
            .FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);

        if (todo is null)
            throw new NotFoundException("Todo", id);

        return new TodoResponse(
            todo.Id,
            todo.UserId,
            todo.Name,
            todo.DueDate,
            todo.Notes,
            todo.TodoItemTags.Select(tt => tt.Tag).ToList(),
            todo.Location,
            todo.CreatedDate
        );
    }

    public async Task<TodoResponse> CreateTodo(MutateTodoRequest request)
    {
        var userId = _httpContextAccessor.GetUserId();

        var todo = new TodoItem
        {
            UserId = userId,
            Name = request.Name,
            DueDate = request.DueDate,
            Notes = request.Notes,
            Location = request.Location
        };
        if (request.Tags is not null && request.Tags.Count > 0)
        {
            var tags = request.Tags
                .Select(tag => new TodoItemTag { Tag = tag })
                .ToList();
            todo.TodoItemTags = tags;
        }

        _dbContext.TodoItems.Add(todo);
        await _dbContext.SaveChangesAsync();

        var createdTodo = await _dbContext.TodoItems
            .Include(t => t.TodoItemTags)
            .FirstAsync(t => t.Id == todo.Id);

        return new TodoResponse(
            createdTodo.Id,
            createdTodo.UserId,
            createdTodo.Name,
            createdTodo.DueDate,
            createdTodo.Notes,
            createdTodo.TodoItemTags.Select(tt => tt.Tag).ToList(),
            createdTodo.Location,
            createdTodo.CreatedDate
        );
    }

    public async Task<TodoResponse> UpdateTodo(int id, MutateTodoRequest request)
    {
        var userId = _httpContextAccessor.GetUserId();

        var todo = await _dbContext.TodoItems
            .Include(t => t.TodoItemTags)
            .FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);

        if (todo is null)
            throw new NotFoundException("Todo", id);

        todo.Name = request.Name;
        todo.DueDate = request.DueDate;
        todo.Notes = request.Notes;
        todo.Location = request.Location;
        // do a full replace of tags on each update for simplicity's sake
        _dbContext.TodoItemTags.RemoveRange(todo.TodoItemTags);
        if (request.Tags is not null && request.Tags.Count > 0)
        {
            var tags = request.Tags
                .Select(tag => new TodoItemTag { TodoItemId = todo.Id, Tag = tag })
                .ToList();
            _dbContext.TodoItemTags.AddRange(tags);
        }

        await _dbContext.SaveChangesAsync();

        // Reload with tags
        var updatedTodo = await _dbContext.TodoItems
            .Include(t => t.TodoItemTags)
            .FirstAsync(t => t.Id == todo.Id);

        return new TodoResponse(
            updatedTodo.Id,
            updatedTodo.UserId,
            updatedTodo.Name,
            updatedTodo.DueDate,
            updatedTodo.Notes,
            updatedTodo.TodoItemTags.Select(tt => tt.Tag).ToList(),
            updatedTodo.Location,
            updatedTodo.CreatedDate
        );
    }

    public async Task DeleteTodo(int id)
    {
        var userId = _httpContextAccessor.GetUserId();

        var todo = await _dbContext.TodoItems
            .FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);

        if (todo is null)
            throw new NotFoundException("Todo", id);

        _dbContext.TodoItems.Remove(todo);
        await _dbContext.SaveChangesAsync();
    }
}
