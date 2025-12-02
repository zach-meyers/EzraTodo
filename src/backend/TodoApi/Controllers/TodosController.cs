using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TodoApi.Data;
using TodoApi.DTOs;
using TodoApi.Exceptions;
using TodoApi.Models;

namespace TodoApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TodosController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly ILogger<TodosController> _logger;

    public TodosController(AppDbContext context, ILogger<TodosController> logger)
    {
        _context = context;
        _logger = logger;
    }

    private int GetUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return int.Parse(userIdClaim ?? "0");
    }

    [HttpGet]
    public async Task<ActionResult<List<TodoResponse>>> GetTodos(
        [FromQuery] DateTime? dueDateFrom,
        [FromQuery] DateTime? dueDateTo,
        [FromQuery] DateTime? createdDateFrom,
        [FromQuery] DateTime? createdDateTo,
        [FromQuery] string? tag)
    {
        var userId = GetUserId();

        var query = _context.TodoItems
            .Include(t => t.TodoItemTags)
            .Where(t => t.UserId == userId);

        // Apply filters
        if (dueDateFrom.HasValue)
            query = query.Where(t => t.DueDate >= dueDateFrom.Value);

        if (dueDateTo.HasValue)
            query = query.Where(t => t.DueDate <= dueDateTo.Value);

        if (createdDateFrom.HasValue)
            query = query.Where(t => t.CreatedDate >= createdDateFrom.Value);

        if (createdDateTo.HasValue)
            query = query.Where(t => t.CreatedDate <= createdDateTo.Value);

        if (!string.IsNullOrWhiteSpace(tag))
            query = query.Where(t => t.TodoItemTags.Any(tt => tt.Tag == tag));

        var todos = await query.ToListAsync();

        var response = todos.Select(t => new TodoResponse(
            t.Id,
            t.UserId,
            t.Name,
            t.DueDate,
            t.Notes,
            t.TodoItemTags.Select(tt => tt.Tag).ToList(),
            t.Location,
            t.CreatedDate
        )).ToList();

        return Ok(response);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<TodoResponse>> GetTodo(int id)
    {
        var userId = GetUserId();

        var todo = await _context.TodoItems
            .Include(t => t.TodoItemTags)
            .FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);

        if (todo == null)
            throw new NotFoundException("Todo", id);

        var response = new TodoResponse(
            todo.Id,
            todo.UserId,
            todo.Name,
            todo.DueDate,
            todo.Notes,
            todo.TodoItemTags.Select(tt => tt.Tag).ToList(),
            todo.Location,
            todo.CreatedDate
        );

        return Ok(response);
    }

    [HttpPost]
    public async Task<ActionResult<TodoResponse>> CreateTodo([FromBody] CreateTodoRequest request)
    {
        var userId = GetUserId();

        var todo = new TodoItem
        {
            UserId = userId,
            Name = request.Name,
            DueDate = request.DueDate,
            Notes = request.Notes,
            Location = request.Location
        };

        _context.TodoItems.Add(todo);
        await _context.SaveChangesAsync();

        // Add tags if provided
        if (request.Tags != null && request.Tags.Any())
        {
            var tags = request.Tags.Select(tag => new TodoItemTag
            {
                TodoItemId = todo.Id,
                Tag = tag
            }).ToList();

            _context.TodoItemTags.AddRange(tags);
            await _context.SaveChangesAsync();
        }

        // Reload with tags
        var createdTodo = await _context.TodoItems
            .Include(t => t.TodoItemTags)
            .FirstAsync(t => t.Id == todo.Id);

        var response = new TodoResponse(
            createdTodo.Id,
            createdTodo.UserId,
            createdTodo.Name,
            createdTodo.DueDate,
            createdTodo.Notes,
            createdTodo.TodoItemTags.Select(tt => tt.Tag).ToList(),
            createdTodo.Location,
            createdTodo.CreatedDate
        );

        return CreatedAtAction(nameof(GetTodo), new { id = todo.Id }, response);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<TodoResponse>> UpdateTodo(int id, [FromBody] UpdateTodoRequest request)
    {
        var userId = GetUserId();

        if (id != request.Id)
        {
            throw new ValidationException(new Dictionary<string, string[]>
            {
                ["Id"] = new[] { "ID in URL must match ID in body" }
            });
        }

        var todo = await _context.TodoItems
            .Include(t => t.TodoItemTags)
            .FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);

        if (todo == null)
            throw new NotFoundException("Todo", id);

        // Update todo fields
        todo.Name = request.Name;
        todo.DueDate = request.DueDate;
        todo.Notes = request.Notes;
        todo.Location = request.Location;

        // Update tags - remove old ones and add new ones
        _context.TodoItemTags.RemoveRange(todo.TodoItemTags);

        if (request.Tags != null && request.Tags.Any())
        {
            var newTags = request.Tags.Select(tag => new TodoItemTag
            {
                TodoItemId = todo.Id,
                Tag = tag
            }).ToList();

            _context.TodoItemTags.AddRange(newTags);
        }

        await _context.SaveChangesAsync();

        // Reload with tags
        var updatedTodo = await _context.TodoItems
            .Include(t => t.TodoItemTags)
            .FirstAsync(t => t.Id == todo.Id);

        var response = new TodoResponse(
            updatedTodo.Id,
            updatedTodo.UserId,
            updatedTodo.Name,
            updatedTodo.DueDate,
            updatedTodo.Notes,
            updatedTodo.TodoItemTags.Select(tt => tt.Tag).ToList(),
            updatedTodo.Location,
            updatedTodo.CreatedDate
        );

        return Ok(response);
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteTodo(int id)
    {
        var userId = GetUserId();

        var todo = await _context.TodoItems
            .FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);

        if (todo == null)
            throw new NotFoundException("Todo", id);

        _context.TodoItems.Remove(todo);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
