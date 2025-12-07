using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using TodoApi.Data;
using TodoApi.Data.Entities;
using TodoApi.Exceptions;
using TodoApi.Models.Auth;
using TodoApi.Options;
using TodoApi.Services;

namespace TodoApi.Tests.Services;

public class AuthServiceTests : IDisposable
{
    private readonly AppDbContext _dbContext;
    private readonly AuthService _authService;

    public AuthServiceTests()
    {
        // Setup in-memory database
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        _dbContext = new AppDbContext(options);

        // Setup JWT options
        var jwtOptions = new JwtOptions
        {
            SecretKey = "TestSecretKeyThatsAtleast128Bits!",
            Issuer = "TestIssuer",
            Audience = "TestAudience"
        };

        var jwtOptionsWrapper = new OptionsWrapper<JwtOptions>(jwtOptions);
        _authService = new AuthService(jwtOptionsWrapper, _dbContext);
    }

    [Fact]
    public async Task Signup_WithValidCredentials_ReturnsAuthResponseWithToken()
    {
        // Arrange
        var request = new SignupRequest("test@example.com", "TestPassword123");

        // Act
        var result = await _authService.Signup(request);

        // Assert
        result.Should().NotBeNull();
        result.Token.Should().NotBeNullOrEmpty();
        result.Email.Should().Be(request.Email);
        result.UserId.Should().BeGreaterThan(0);

        // Verify user was created in database
        var user = await _dbContext.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
        user.Should().NotBeNull();
        user!.PasswordHash.Should().NotBe(request.Password); // Password should be hashed
    }

    [Fact]
    public async Task Signup_WithExistingEmail_ThrowsConflictException()
    {
        // Arrange
        var email = "existing@example.com";
        var existingUser = new User
        {
            Email = email,
            PasswordHash = "hashedpassword"
        };
        _dbContext.Users.Add(existingUser);
        await _dbContext.SaveChangesAsync();

        var request = new SignupRequest(email, "TestPassword123");

        // Act
        Func<Task> act = async () => await _authService.Signup(request);

        // Assert
        await act.Should().ThrowAsync<ConflictException>()
            .WithMessage("User with this email already exists");
    }

    [Fact]
    public async Task Login_WithValidCredentials_ReturnsAuthResponseWithToken()
    {
        // Arrange
        var email = "login@example.com";
        var password = "TestPassword123";

        // First create a user via signup
        await _authService.Signup(new SignupRequest(email, password));

        var loginRequest = new LoginRequest(email, password);

        // Act
        var result = await _authService.Login(loginRequest);

        // Assert
        result.Should().NotBeNull();
        result.Token.Should().NotBeNullOrEmpty();
        result.Email.Should().Be(email);
        result.UserId.Should().BeGreaterThan(0);
    }

    [Fact]
    public async Task Login_WithInvalidPassword_ThrowsUnauthorizedException()
    {
        // Arrange
        var email = "user@example.com";
        var password = "CorrectPassword";

        // Create user
        await _authService.Signup(new SignupRequest(email, password));

        var loginRequest = new LoginRequest(email, "WrongPassword");

        // Act
        Func<Task> act = async () => await _authService.Login(loginRequest);

        // Assert
        await act.Should().ThrowAsync<UnauthorizedException>()
            .WithMessage("Invalid email or password");
    }

    [Fact]
    public async Task Login_WithNonExistentUser_ThrowsUnauthorizedException()
    {
        // Arrange
        var loginRequest = new LoginRequest("nonexistent@example.com", "SomePassword");

        // Act
        Func<Task> act = async () => await _authService.Login(loginRequest);

        // Assert
        await act.Should().ThrowAsync<UnauthorizedException>()
            .WithMessage("Invalid email or password");
    }

    [Fact]
    public void HashPassword_ProducesValidBCryptHash()
    {
        // Arrange
        var password = "TestPassword123";

        // Act
        var hash = _authService.HashPassword(password);

        // Assert
        hash.Should().NotBeNullOrEmpty();
        hash.Should().NotBe(password); // Hash should be different from plaintext
        hash.Should().StartWith("$2"); // BCrypt hashes start with $2a, $2b, or $2y

        // Verify the hash can be verified with BCrypt
        var isValid = BCrypt.Net.BCrypt.Verify(password, hash);
        isValid.Should().BeTrue();
    }

    [Fact]
    public async Task Signup_CreatesUserWithHashedPassword()
    {
        // Arrange
        var request = new SignupRequest("hashtest@example.com", "PlaintextPassword");

        // Act
        await _authService.Signup(request);

        // Assert
        var user = await _dbContext.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
        user.Should().NotBeNull();
        user!.PasswordHash.Should().NotBe(request.Password);
        user.PasswordHash.Should().StartWith("$2"); // BCrypt hash format
    }

    [Fact]
    public async Task Login_GeneratesValidJwtToken()
    {
        // Arrange
        var email = "jwt@example.com";
        var password = "TestPassword";

        await _authService.Signup(new SignupRequest(email, password));
        var loginRequest = new LoginRequest(email, password);

        // Act
        var result = await _authService.Login(loginRequest);

        // Assert
        result.Token.Should().NotBeNullOrEmpty();

        // JWT tokens have 3 parts separated by dots
        var tokenParts = result.Token.Split('.');
        tokenParts.Should().HaveCount(3);
    }

    public void Dispose()
    {
        _dbContext.Database.EnsureDeleted();
        _dbContext.Dispose();
    }
}
