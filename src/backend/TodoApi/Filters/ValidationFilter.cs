using Microsoft.AspNetCore.Mvc.Filters;
using TodoApi.Exceptions;

namespace TodoApi.Filters;

public class ValidationFilter : IActionFilter
{
    public void OnActionExecuting(ActionExecutingContext context)
    {
        if (context.ModelState.IsValid)
            return;

        var errors = context.ModelState
            .Where(x => x.Value?.Errors.Count > 0)
            .ToDictionary(
                kvp => kvp.Key,
                kvp => kvp.Value!.Errors.Select(e => e.ErrorMessage).ToArray()
            );
        throw new ValidationException(errors);
    }

    public void OnActionExecuted(ActionExecutedContext context) { }
}
