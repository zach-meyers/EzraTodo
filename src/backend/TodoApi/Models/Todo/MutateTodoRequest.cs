using FluentValidation;

namespace TodoApi.Models.Todo;

public record MutateTodoRequest(
    string Name,
    DateTime DueDate,
    string? Notes,
    List<string>? Tags,
    string? Location
);

public class CreateTodoRequestValidator : AbstractValidator<MutateTodoRequest>
{
    public CreateTodoRequestValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Name is required")
            .MaximumLength(200).WithMessage("Name must not exceed 200 characters");

        RuleFor(x => x.DueDate)
            .NotEmpty().WithMessage("Due date is required");
    }
}