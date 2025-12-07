using TodoApi.Models.Auth;

namespace TodoApi.Services;

public interface IAuthService
{
    Task<AuthResponse> Signup(SignupRequest request);
    Task<AuthResponse> Login(LoginRequest request);
    internal string HashPassword(string password);
}