namespace TodoApi.Exceptions;

public class NotFoundException : AppException
{
    public NotFoundException(string resource, object id)
        : base($"{resource} with id {id} not found", 404, "NOT_FOUND")
    {
    }
}
