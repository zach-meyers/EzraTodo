using System.Text.Json;
using FluentAssertions;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Moq;
using TodoApi.Exceptions;
using TodoApi.Middleware;
using TodoApi.Models;

namespace TodoApi.Tests.Middleware;

public class ExceptionHandlerMiddlewareTests
{
    private readonly Mock<ILogger<ExceptionHandlerMiddleware>> _loggerMock;
    private readonly Mock<IWebHostEnvironment> _environmentMock;
    private readonly DefaultHttpContext _httpContext;

    public ExceptionHandlerMiddlewareTests()
    {
        _loggerMock = new Mock<ILogger<ExceptionHandlerMiddleware>>();
        _environmentMock = new Mock<IWebHostEnvironment>();
        _httpContext = new DefaultHttpContext { Response = { Body = new MemoryStream() } };
    }

    [Fact]
    public async Task NotFoundException_Returns404WithErrorResponse()
    {
        // Arrange
        var exception = new NotFoundException("Todo", 123);
        RequestDelegate next = _ => throw exception;

        var middleware = new ExceptionHandlerMiddleware(next, _loggerMock.Object, _environmentMock.Object);

        // Act
        await middleware.InvokeAsync(_httpContext);

        // Assert
        _httpContext.Response.StatusCode.Should().Be(404);
        _httpContext.Response.ContentType.Should().Be("application/json");

        var response = await GetResponseBody<ErrorResponse>();
        response.Should().NotBeNull();
        response!.StatusCode.Should().Be(404);
        response.ErrorCode.Should().Be("NOT_FOUND");
        response.Message.Should().Contain("Todo");
        response.Message.Should().Contain("123");
        response.TraceId.Should().NotBeNullOrEmpty();
    }

    [Fact]
    public async Task UnauthorizedException_Returns401WithErrorResponse()
    {
        // Arrange
        var exception = new UnauthorizedException("Invalid credentials");
        RequestDelegate next = _ => throw exception;

        var middleware = new ExceptionHandlerMiddleware(next, _loggerMock.Object, _environmentMock.Object);

        // Act
        await middleware.InvokeAsync(_httpContext);

        // Assert
        _httpContext.Response.StatusCode.Should().Be(401);

        var response = await GetResponseBody<ErrorResponse>();
        response.Should().NotBeNull();
        response!.StatusCode.Should().Be(401);
        response.ErrorCode.Should().Be("UNAUTHORIZED");
        response.Message.Should().Be("Invalid credentials");
    }

    [Fact]
    public async Task ConflictException_Returns409WithErrorResponse()
    {
        // Arrange
        var exception = new ConflictException("User already exists");
        RequestDelegate next = _ => throw exception;

        var middleware = new ExceptionHandlerMiddleware(next, _loggerMock.Object, _environmentMock.Object);

        // Act
        await middleware.InvokeAsync(_httpContext);

        // Assert
        _httpContext.Response.StatusCode.Should().Be(409);

        var response = await GetResponseBody<ErrorResponse>();
        response.Should().NotBeNull();
        response!.StatusCode.Should().Be(409);
        response.ErrorCode.Should().Be("CONFLICT");
        response.Message.Should().Be("User already exists");
    }

    [Fact]
    public async Task ValidationException_Returns400WithValidationErrors()
    {
        // Arrange
        var validationErrors = new Dictionary<string, string[]>
        {
            { "Email", ["Email is required", "Invalid email format"] },
            { "Password", ["Password must be at least 8 characters"] }
        };
        var exception = new ValidationException(validationErrors);
        RequestDelegate next = _ => throw exception;

        var middleware = new ExceptionHandlerMiddleware(next, _loggerMock.Object, _environmentMock.Object);

        // Act
        await middleware.InvokeAsync(_httpContext);

        // Assert
        _httpContext.Response.StatusCode.Should().Be(400);

        var response = await GetResponseBody<ErrorResponse>();
        response.Should().NotBeNull();
        response!.StatusCode.Should().Be(400);
        response.ErrorCode.Should().Be("VALIDATION_ERROR");
        response.Message.Should().Be("Validation failed");
        response.ValidationErrors.Should().NotBeNull();
        response.ValidationErrors.Should().HaveCount(2);
        response.ValidationErrors!["Email"].Should().HaveCount(2);
        response.ValidationErrors["Password"].Should().HaveCount(1);
    }

    [Fact]
    public async Task UnhandledException_Returns500WithGenericMessage()
    {
        // Arrange
        var exception = new InvalidOperationException("Something went wrong internally");
        RequestDelegate next = _ => throw exception;

        _environmentMock.Setup(e => e.EnvironmentName).Returns("Production");

        var middleware = new ExceptionHandlerMiddleware(next, _loggerMock.Object, _environmentMock.Object);

        // Act
        await middleware.InvokeAsync(_httpContext);

        // Assert
        _httpContext.Response.StatusCode.Should().Be(500);

        var response = await GetResponseBody<ErrorResponse>();
        response.Should().NotBeNull();
        response!.StatusCode.Should().Be(500);
        response.ErrorCode.Should().Be("INTERNAL_SERVER_ERROR");
        response.Message.Should().Be("An unexpected error occurred");
        response.Details.Should().BeNull(); // Should not expose stack trace in production
    }

    [Fact]
    public async Task UnhandledException_InDevelopment_IncludesStackTrace()
    {
        // Arrange
        var exception = new InvalidOperationException("Something went wrong");
        RequestDelegate next = _ => throw exception;

        _environmentMock.Setup(e => e.EnvironmentName).Returns("Development");

        var middleware = new ExceptionHandlerMiddleware(next, _loggerMock.Object, _environmentMock.Object);

        // Act
        await middleware.InvokeAsync(_httpContext);

        // Assert
        var response = await GetResponseBody<ErrorResponse>();
        response.Should().NotBeNull();
        response!.Details.Should().NotBeNullOrEmpty(); // Should include stack trace in development
    }

    [Fact]
    public async Task ArgumentException_Returns400WithBadRequestError()
    {
        // Arrange
        var exception = new ArgumentException("Invalid parameter");
        RequestDelegate next = _ => throw exception;

        var middleware = new ExceptionHandlerMiddleware(next, _loggerMock.Object, _environmentMock.Object);

        // Act
        await middleware.InvokeAsync(_httpContext);

        // Assert
        _httpContext.Response.StatusCode.Should().Be(400);

        var response = await GetResponseBody<ErrorResponse>();
        response.Should().NotBeNull();
        response!.StatusCode.Should().Be(400);
        response.ErrorCode.Should().Be("BAD_REQUEST");
        response.Message.Should().Be("Invalid request format or parameters");
    }

    [Fact]
    public async Task UnauthorizedAccessException_Returns401()
    {
        // Arrange
        var exception = new UnauthorizedAccessException();
        RequestDelegate next = _ => throw exception;

        var middleware = new ExceptionHandlerMiddleware(next, _loggerMock.Object, _environmentMock.Object);

        // Act
        await middleware.InvokeAsync(_httpContext);

        // Assert
        _httpContext.Response.StatusCode.Should().Be(401);

        var response = await GetResponseBody<ErrorResponse>();
        response.Should().NotBeNull();
        response!.StatusCode.Should().Be(401);
        response.ErrorCode.Should().Be("UNAUTHORIZED");
    }

    [Fact]
    public async Task SuccessfulRequest_DoesNotModifyResponse()
    {
        // Arrange
        var wasNextCalled = false;
        RequestDelegate next = context =>
        {
            wasNextCalled = true;
            context.Response.StatusCode = 200;
            return Task.CompletedTask;
        };

        var middleware = new ExceptionHandlerMiddleware(next, _loggerMock.Object, _environmentMock.Object);

        // Act
        await middleware.InvokeAsync(_httpContext);

        // Assert
        wasNextCalled.Should().BeTrue();
        _httpContext.Response.StatusCode.Should().Be(200);
    }

    [Fact]
    public async Task ErrorResponse_ContainsTraceIdAndTimestamp()
    {
        // Arrange
        var exception = new NotFoundException("Todo", 1);
        RequestDelegate next = _ => throw exception;

        var middleware = new ExceptionHandlerMiddleware(next, _loggerMock.Object, _environmentMock.Object);
        _httpContext.TraceIdentifier = "test-trace-id";

        // Act
        await middleware.InvokeAsync(_httpContext);

        // Assert
        var response = await GetResponseBody<ErrorResponse>();
        response.Should().NotBeNull();
        response!.TraceId.Should().Be("test-trace-id");
        response.Timestamp.Should().NotBeNullOrEmpty();

        // Verify timestamp is in ISO format
        var parsedTimestamp = DateTime.TryParse(response.Timestamp, out _);
        parsedTimestamp.Should().BeTrue();
    }

    private async Task<T?> GetResponseBody<T>() where T : class
    {
        _httpContext.Response.Body.Seek(0, SeekOrigin.Begin);
        using var reader = new StreamReader(_httpContext.Response.Body);
        var responseBody = await reader.ReadToEndAsync();

        if (string.IsNullOrEmpty(responseBody))
            return null;

        return JsonSerializer.Deserialize<T>(responseBody, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });
    }
}
