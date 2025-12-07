using System.Security.Claims;

namespace TodoApi.Extensions;

public static class HttpContextAccessorExtensions
{
    public static int GetUserId(this IHttpContextAccessor httpContextAccessor)
    {
        if (httpContextAccessor.HttpContext is null)
        {
            throw new ArgumentException("No active http context available");
        }

        var userId = httpContextAccessor.HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return userId.IsNullOrWhiteSpace()
            ? throw new ArgumentException("No valid user id available on http context")
            : int.Parse(userId);
    }
}
