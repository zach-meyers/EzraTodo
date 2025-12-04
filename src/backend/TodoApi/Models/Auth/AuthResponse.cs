namespace TodoApi.Models.Auth;

public record AuthResponse(string Token, string Email, int UserId);