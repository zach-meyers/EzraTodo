using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TodoApi.Models.Todo;
using TodoApi.Services;

namespace TodoApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TodoController : ControllerBase
{
    private readonly ITodoService _todoService;

    public TodoController(ITodoService todoService)
    {
        _todoService = todoService;
    }

    [HttpGet]
    public async Task<ActionResult<List<TodoResponse>>> GetTodos()
    {
        var response = await _todoService.GetTodos();
        return Ok(response);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<TodoResponse>> GetTodo(int id)
    {
        var response = await _todoService.GetTodo(id);
        return Ok(response);
    }

    [HttpPost]
    public async Task<ActionResult<TodoResponse>> CreateTodo([FromBody] MutateTodoRequest request)
    {
        var response = await _todoService.CreateTodo(request);
        return CreatedAtAction(nameof(GetTodo), new { id = response.Id }, response);
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<TodoResponse>> UpdateTodo(int id, [FromBody] MutateTodoRequest request)
    {
        var response = await _todoService.UpdateTodo(id, request);
        return Ok(response);
    }

    [HttpDelete("{id:int}")]
    public async Task<ActionResult> DeleteTodo(int id)
    {
        await _todoService.DeleteTodo(id);
        return NoContent();
    }
}