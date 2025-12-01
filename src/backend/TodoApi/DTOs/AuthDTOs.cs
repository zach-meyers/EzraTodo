namespace TodoApi.DTOs;

public record LoginRequest(string Email, string Password);

public record SignupRequest(string Email, string Password);

public record AuthResponse(string Token, string Email, int UserId);
