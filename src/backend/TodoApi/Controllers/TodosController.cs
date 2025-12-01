using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TodoApi.Data;
using TodoApi.DTOs;
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
        try
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
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving todos");
            return StatusCode(500, "An error occurred while retrieving todos");
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<TodoResponse>> GetTodo(int id)
    {
        try
        {
            var userId = GetUserId();

            var todo = await _context.TodoItems
                .Include(t => t.TodoItemTags)
                .FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);

            if (todo == null)
                return NotFound();

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
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving todo");
            return StatusCode(500, "An error occurred while retrieving the todo");
        }
    }

    [HttpPost]
    public async Task<ActionResult<TodoResponse>> CreateTodo([FromBody] CreateTodoRequest request)
    {
        try
        {
            var userId = GetUserId();

            if (string.IsNullOrWhiteSpace(request.Name))
                return BadRequest("Name is required");

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
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating todo");
            return StatusCode(500, "An error occurred while creating the todo");
        }
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<TodoResponse>> UpdateTodo(int id, [FromBody] UpdateTodoRequest request)
    {
        try
        {
            var userId = GetUserId();

            if (id != request.Id)
                return BadRequest("ID mismatch");

            var todo = await _context.TodoItems
                .Include(t => t.TodoItemTags)
                .FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);

            if (todo == null)
                return NotFound();

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
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating todo");
            return StatusCode(500, "An error occurred while updating the todo");
        }
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteTodo(int id)
    {
        try
        {
            var userId = GetUserId();

            var todo = await _context.TodoItems
                .FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);

            if (todo == null)
                return NotFound();

            _context.TodoItems.Remove(todo);
            await _context.SaveChangesAsync();

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting todo");
            return StatusCode(500, "An error occurred while deleting the todo");
        }
    }
}
