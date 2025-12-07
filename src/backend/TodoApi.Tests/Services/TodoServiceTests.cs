using System.Security.Claims;
using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Moq;
using TodoApi.Data;
using TodoApi.Data.Entities;
using TodoApi.Exceptions;
using TodoApi.Models.Todo;
using TodoApi.Services;

namespace TodoApi.Tests.Services;

public class TodoServiceTests : IDisposable
{
    private readonly AppDbContext _dbContext;
    private readonly Mock<IHttpContextAccessor> _httpContextAccessorMock;
    private readonly TodoService _todoService;
    private readonly int _testUserId = 1;
    private readonly int _otherUserId = 2;

    public TodoServiceTests()
    {
        // Setup in-memory database
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        _dbContext = new AppDbContext(options);

        // Setup mocks
        var loggerMock = new Mock<ILogger<TodoService>>();
        _httpContextAccessorMock = new Mock<IHttpContextAccessor>();

        // Setup default user context
        SetupHttpContextWithUser(_testUserId);

        _todoService = new TodoService(loggerMock.Object, _dbContext, _httpContextAccessorMock.Object);

        // Seed test users
        SeedTestUsers().Wait();
    }

    private async Task SeedTestUsers()
    {
        _dbContext.Users.AddRange(
            new User { Id = _testUserId, Email = "testuser@example.com", PasswordHash = "hash1" },
            new User { Id = _otherUserId, Email = "otheruser@example.com", PasswordHash = "hash2" }
        );
        await _dbContext.SaveChangesAsync();
    }

    private void SetupHttpContextWithUser(int userId)
    {
        var claims = new[] { new Claim(ClaimTypes.NameIdentifier, userId.ToString()) };
        var identity = new ClaimsIdentity(claims);
        var claimsPrincipal = new ClaimsPrincipal(identity);

        var httpContext = new DefaultHttpContext
        {
            User = claimsPrincipal
        };

        _httpContextAccessorMock.Setup(x => x.HttpContext).Returns(httpContext);
    }

    [Fact]
    public async Task GetTodos_ReturnsOnlyCurrentUsersTodos()
    {
        // Arrange
        var userTodo = new TodoItem
        {
            UserId = _testUserId,
            Name = "User's Todo",
            DueDate = DateTime.UtcNow.AddDays(1)
        };
        var otherUserTodo = new TodoItem
        {
            UserId = _otherUserId,
            Name = "Other User's Todo",
            DueDate = DateTime.UtcNow.AddDays(1)
        };

        _dbContext.TodoItems.AddRange(userTodo, otherUserTodo);
        await _dbContext.SaveChangesAsync();

        // Act
        var result = await _todoService.GetTodos();

        // Assert
        result.Should().HaveCount(1);
        result.First().Name.Should().Be("User's Todo");
        result.First().UserId.Should().Be(_testUserId);
    }

    [Fact]
    public async Task GetTodo_WithValidId_ReturnsTodo()
    {
        // Arrange
        var todo = new TodoItem
        {
            UserId = _testUserId,
            Name = "Test Todo",
            DueDate = DateTime.UtcNow.AddDays(1),
            Notes = "Test notes",
            Location = "Test location"
        };
        _dbContext.TodoItems.Add(todo);
        await _dbContext.SaveChangesAsync();

        // Act
        var result = await _todoService.GetTodo(todo.Id);

        // Assert
        result.Should().NotBeNull();
        result.Id.Should().Be(todo.Id);
        result.Name.Should().Be(todo.Name);
        result.Notes.Should().Be(todo.Notes);
        result.Location.Should().Be(todo.Location);
    }

    [Fact]
    public async Task GetTodo_WithInvalidId_ThrowsNotFoundException()
    {
        // Act
        var act = async () => await _todoService.GetTodo(999);

        // Assert
        await act.Should().ThrowAsync<NotFoundException>()
            .WithMessage("*Todo*not found*");
    }

    [Fact]
    public async Task GetTodo_BelongingToOtherUser_ThrowsNotFoundException()
    {
        // Arrange
        var otherUserTodo = new TodoItem
        {
            UserId = _otherUserId,
            Name = "Other's Todo",
            DueDate = DateTime.UtcNow.AddDays(1)
        };
        _dbContext.TodoItems.Add(otherUserTodo);
        await _dbContext.SaveChangesAsync();

        // Act
        var act = async () => await _todoService.GetTodo(otherUserTodo.Id);

        // Assert - Should throw NotFoundException because user isolation prevents access
        await act.Should().ThrowAsync<NotFoundException>();
    }

    [Fact]
    public async Task CreateTodo_WithValidData_ReturnsTodoResponse()
    {
        // Arrange
        var request = new MutateTodoRequest(
            "New Todo",
            DateTime.UtcNow.AddDays(2),
            "New notes",
            new List<string> { "tag1", "tag2" },
            "New location"
        );

        // Act
        var result = await _todoService.CreateTodo(request);

        // Assert
        result.Should().NotBeNull();
        result.Id.Should().BeGreaterThan(0);
        result.UserId.Should().Be(_testUserId);
        result.Name.Should().Be(request.Name);
        result.Notes.Should().Be(request.Notes);
        result.Location.Should().Be(request.Location);
        result.Tags.Should().HaveCount(2);
        result.Tags.Should().Contain("tag1");
        result.Tags.Should().Contain("tag2");

        // Verify in database
        var dbTodo = await _dbContext.TodoItems
            .Include(t => t.TodoItemTags)
            .FirstOrDefaultAsync(t => t.Id == result.Id);
        dbTodo.Should().NotBeNull();
        dbTodo!.TodoItemTags.Should().HaveCount(2);
    }

    [Fact]
    public async Task CreateTodo_WithoutTags_CreatesSuccessfully()
    {
        // Arrange
        var request = new MutateTodoRequest(
            "Todo without tags",
            DateTime.UtcNow.AddDays(1),
            null,
            null,
            null
        );

        // Act
        var result = await _todoService.CreateTodo(request);

        // Assert
        result.Should().NotBeNull();
        result.Tags.Should().BeEmpty();
    }

    [Fact]
    public async Task UpdateTodo_WithValidData_ReturnsUpdatedTodo()
    {
        // Arrange
        var todo = new TodoItem
        {
            UserId = _testUserId,
            Name = "Original Name",
            DueDate = DateTime.UtcNow.AddDays(1),
            TodoItemTags = new List<TodoItemTag>
            {
                new() { Tag = "oldtag" }
            }
        };
        _dbContext.TodoItems.Add(todo);
        await _dbContext.SaveChangesAsync();

        var updateRequest = new MutateTodoRequest(
            "Updated Name",
            DateTime.UtcNow.AddDays(3),
            "Updated notes",
            new List<string> { "newtag1", "newtag2" },
            "Updated location"
        );

        // Act
        var result = await _todoService.UpdateTodo(todo.Id, updateRequest);

        // Assert
        result.Should().NotBeNull();
        result.Name.Should().Be("Updated Name");
        result.Notes.Should().Be("Updated notes");
        result.Location.Should().Be("Updated location");
        result.Tags.Should().HaveCount(2);
        result.Tags.Should().Contain("newtag1");
        result.Tags.Should().NotContain("oldtag");
    }

    [Fact]
    public async Task UpdateTodo_RemovesTags_WhenTagsNotProvided()
    {
        // Arrange
        var todo = new TodoItem
        {
            UserId = _testUserId,
            Name = "Todo with tags",
            DueDate = DateTime.UtcNow.AddDays(1),
            TodoItemTags = new List<TodoItemTag>
            {
                new() { Tag = "tag1" },
                new() { Tag = "tag2" }
            }
        };
        _dbContext.TodoItems.Add(todo);
        await _dbContext.SaveChangesAsync();

        var updateRequest = new MutateTodoRequest(
            "Updated Todo",
            DateTime.UtcNow.AddDays(2),
            null,
            null,
            null
        );

        // Act
        var result = await _todoService.UpdateTodo(todo.Id, updateRequest);

        // Assert
        result.Tags.Should().BeEmpty();
    }

    [Fact]
    public async Task UpdateTodo_BelongingToOtherUser_ThrowsNotFoundException()
    {
        // Arrange
        var otherUserTodo = new TodoItem
        {
            UserId = _otherUserId,
            Name = "Other's Todo",
            DueDate = DateTime.UtcNow.AddDays(1)
        };
        _dbContext.TodoItems.Add(otherUserTodo);
        await _dbContext.SaveChangesAsync();

        var updateRequest = new MutateTodoRequest(
            "Attempted Update",
            DateTime.UtcNow.AddDays(2),
            null,
            null,
            null
        );

        // Act
        var act = async () => await _todoService.UpdateTodo(otherUserTodo.Id, updateRequest);

        // Assert
        await act.Should().ThrowAsync<NotFoundException>();
    }

    [Fact]
    public async Task DeleteTodo_WithValidId_RemovesTodo()
    {
        // Arrange
        var todo = new TodoItem
        {
            UserId = _testUserId,
            Name = "Todo to delete",
            DueDate = DateTime.UtcNow.AddDays(1)
        };
        _dbContext.TodoItems.Add(todo);
        await _dbContext.SaveChangesAsync();
        var todoId = todo.Id;

        // Act
        await _todoService.DeleteTodo(todoId);

        // Assert
        var deletedTodo = await _dbContext.TodoItems.FindAsync(todoId);
        deletedTodo.Should().BeNull();
    }

    [Fact]
    public async Task DeleteTodo_BelongingToOtherUser_ThrowsNotFoundException()
    {
        // Arrange
        var otherUserTodo = new TodoItem
        {
            UserId = _otherUserId,
            Name = "Other's Todo",
            DueDate = DateTime.UtcNow.AddDays(1)
        };
        _dbContext.TodoItems.Add(otherUserTodo);
        await _dbContext.SaveChangesAsync();

        // Act
        var act = async () => await _todoService.DeleteTodo(otherUserTodo.Id);

        // Assert
        await act.Should().ThrowAsync<NotFoundException>();

        // Verify todo still exists
        var todo = await _dbContext.TodoItems.FindAsync(otherUserTodo.Id);
        todo.Should().NotBeNull();
    }

    [Fact]
    public async Task GetTodos_WithMultipleTodos_ReturnsAllUserTodos()
    {
        // Arrange
        var todos = new List<TodoItem>
        {
            new() { UserId = _testUserId, Name = "Todo 1", DueDate = DateTime.UtcNow.AddDays(1) },
            new() { UserId = _testUserId, Name = "Todo 2", DueDate = DateTime.UtcNow.AddDays(2) },
            new() { UserId = _testUserId, Name = "Todo 3", DueDate = DateTime.UtcNow.AddDays(3) },
            new() { UserId = _otherUserId, Name = "Other Todo", DueDate = DateTime.UtcNow.AddDays(1) }
        };
        _dbContext.TodoItems.AddRange(todos);
        await _dbContext.SaveChangesAsync();

        // Act
        var result = await _todoService.GetTodos();

        // Assert
        result.Should().HaveCount(3);
        result.All(t => t.UserId == _testUserId).Should().BeTrue();
    }

    public void Dispose()
    {
        _dbContext.Database.EnsureDeleted();
        _dbContext.Dispose();
    }
}
