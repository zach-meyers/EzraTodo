using System.Net;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using TodoApi.Exceptions;
using TodoApi.Models;

namespace TodoApi.Middleware;

public class ExceptionHandlerMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlerMiddleware> _logger;
    private readonly IWebHostEnvironment _environment;

    public ExceptionHandlerMiddleware(
        RequestDelegate next,
        ILogger<ExceptionHandlerMiddleware> logger,
        IWebHostEnvironment environment)
    {
        _next = next;
        _logger = logger;
        _environment = environment;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception exception)
        {
            await HandleExceptionAsync(context, exception);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        var traceId = context.TraceIdentifier;
        var errorResponse = new ErrorResponse
        {
            TraceId = traceId,
            Timestamp = DateTime.UtcNow.ToString("o")
        };

        // Map exception to appropriate status code and error response
        switch (exception)
        {
            case AppException appException:
                errorResponse.StatusCode = appException.StatusCode;
                errorResponse.ErrorCode = appException.ErrorCode;
                errorResponse.Message = appException.Message;

                // Handle validation exceptions specially
                if (appException is ValidationException validationException)
                {
                    errorResponse.ValidationErrors = validationException.ValidationErrors;
                }

                // Log as warning for client errors (4xx)
                if (appException.StatusCode >= 400 && appException.StatusCode < 500)
                {
                    _logger.LogWarning(
                        exception,
                        "Client error occurred. TraceId: {TraceId}, ErrorCode: {ErrorCode}, StatusCode: {StatusCode}, Path: {Path}",
                        traceId,
                        appException.ErrorCode,
                        appException.StatusCode,
                        context.Request.Path
                    );
                }
                else
                {
                    _logger.LogError(
                        exception,
                        "Application error occurred. TraceId: {TraceId}, ErrorCode: {ErrorCode}, StatusCode: {StatusCode}, Path: {Path}",
                        traceId,
                        appException.ErrorCode,
                        appException.StatusCode,
                        context.Request.Path
                    );
                }

                break;

            case DbUpdateException dbException:
                // Check if it's a unique constraint violation or other database error
                var isUniqueConstraintViolation =
                    dbException.InnerException?.Message.Contains("UNIQUE constraint") ?? false;

                if (isUniqueConstraintViolation)
                {
                    errorResponse.StatusCode = (int)HttpStatusCode.Conflict;
                    errorResponse.ErrorCode = "CONFLICT";
                    errorResponse.Message = "A record with this information already exists";
                }
                else
                {
                    errorResponse.StatusCode = (int)HttpStatusCode.InternalServerError;
                    errorResponse.ErrorCode = "DATABASE_ERROR";
                    errorResponse.Message = "An error occurred while updating the database";
                }

                _logger.LogError(
                    dbException,
                    "Database error occurred. TraceId: {TraceId}, Path: {Path}",
                    traceId,
                    context.Request.Path
                );
                break;

            case UnauthorizedAccessException:
                errorResponse.StatusCode = (int)HttpStatusCode.Unauthorized;
                errorResponse.ErrorCode = "UNAUTHORIZED";
                errorResponse.Message = "You are not authorized to access this resource";

                _logger.LogWarning(
                    exception,
                    "Unauthorized access attempt. TraceId: {TraceId}, Path: {Path}",
                    traceId,
                    context.Request.Path
                );
                break;

            case FormatException:
            case ArgumentException:
                errorResponse.StatusCode = (int)HttpStatusCode.BadRequest;
                errorResponse.ErrorCode = "BAD_REQUEST";
                errorResponse.Message = "Invalid request format or parameters";

                _logger.LogWarning(
                    exception,
                    "Bad request received. TraceId: {TraceId}, Path: {Path}",
                    traceId,
                    context.Request.Path
                );
                break;

            default:
                errorResponse.StatusCode = (int)HttpStatusCode.InternalServerError;
                errorResponse.ErrorCode = "INTERNAL_SERVER_ERROR";
                errorResponse.Message = "An unexpected error occurred";

                _logger.LogError(
                    exception,
                    "Unhandled exception occurred. TraceId: {TraceId}, Path: {Path}, ExceptionType: {ExceptionType}",
                    traceId,
                    context.Request.Path,
                    exception.GetType().Name
                );
                break;
        }

        // Include stack trace in development environment only
        if (_environment.IsDevelopment() && errorResponse.StatusCode >= 500)
        {
            errorResponse.Details = exception.StackTrace;
        }

        // Set response
        context.Response.ContentType = "application/json";
        context.Response.StatusCode = errorResponse.StatusCode;
        var json = JsonSerializer.Serialize(errorResponse);
        await context.Response.WriteAsync(json);
    }
}