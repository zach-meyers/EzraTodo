using TodoApi.Models.Todo;

namespace TodoApi.Services;

public interface ITodoService
{
    Task<IList<TodoResponse>> GetTodos();
    Task<TodoResponse> GetTodo(int id);
    Task<TodoResponse> CreateTodo(MutateTodoRequest request);
    Task<TodoResponse> UpdateTodo(int id, MutateTodoRequest request);
    Task DeleteTodo(int id);
}