using TodoApi.Models.Todo;

namespace TodoApi.Services;

public interface ITodoService
{
    Task<IList<TodoResponse>> GetTodos(GetTodosRequest request);
    Task<TodoResponse> GetTodo(int id);
    Task<TodoResponse> CreateTodo(CreateTodoRequest request);
    Task<TodoResponse> UpdateTodo(int id, UpdateTodoRequest request);
    Task DeleteTodo(int id);
}