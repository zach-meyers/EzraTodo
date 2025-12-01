using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TodoApi.Data;
using TodoApi.DTOs;
using TodoApi.Models;
using TodoApi.Services;

namespace TodoApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IAuthService _authService;
    private readonly ILogger<AuthController> _logger;

    public AuthController(AppDbContext context, IAuthService authService, ILogger<AuthController> logger)
    {
        _context = context;
        _authService = authService;
        _logger = logger;
    }

    [HttpPost("signup")]
    public async Task<ActionResult<AuthResponse>> Signup([FromBody] SignupRequest request)
    {
        try
        {
            // Validate input
            if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
            {
                return BadRequest("Email and password are required");
            }

            // Check if user already exists
            var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
            if (existingUser != null)
            {
                return BadRequest("User with this email already exists");
            }

            // Create new user
            var user = new User
            {
                Email = request.Email,
                PasswordHash = _authService.HashPassword(request.Password)
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            // Generate token
            var token = _authService.GenerateJwtToken(user);

            return Ok(new AuthResponse(token, user.Email, user.Id));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during signup");
            return StatusCode(500, "An error occurred during signup");
        }
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login([FromBody] LoginRequest request)
    {
        try
        {
            // Validate input
            if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
            {
                return BadRequest("Email and password are required");
            }

            // Find user
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
            if (user == null)
            {
                return Unauthorized("Invalid email or password");
            }

            // Verify password
            if (!_authService.VerifyPassword(request.Password, user.PasswordHash))
            {
                return Unauthorized("Invalid email or password");
            }

            // Generate token
            var token = _authService.GenerateJwtToken(user);

            return Ok(new AuthResponse(token, user.Email, user.Id));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during login");
            return StatusCode(500, "An error occurred during login");
        }
    }
}
