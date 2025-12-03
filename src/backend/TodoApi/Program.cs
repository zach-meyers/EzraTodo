using FluentValidation;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using TodoApi.Data;
using TodoApi.Filters;
using TodoApi.Middleware;
using TodoApi.Options;
using TodoApi.Services;

var builder = WebApplication.CreateBuilder(args);

// add features to the app service container
builder.Services.AddControllers(options =>
{
    options.Filters.Add<ValidationFilter>();
});
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddOpenApi();

// configure FluentValidation
builder.Services.AddValidatorsFromAssemblyContaining<Program>();

// configure SQLite
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("Todo")));

// configure jwt auth
builder.Services
    .AddOptions<JwtOptions>()
    .Bind(builder.Configuration.GetSection("Jwt"));
builder.Services.ConfigureOptions<ConfigureJwtBearerOptions>();
builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer();
builder.Services.AddAuthorization();

// register services
builder.Services.AddScoped<IAuthService, AuthService>();

// configure CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("TodoApp", policy =>
    {
        policy.WithOrigins("http://localhost:5173", "http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

var app = builder.Build();

// configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();
app.UseMiddleware<GlobalExceptionHandlerMiddleware>();
app.UseCors("TodoApp");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

// apply database migrations
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();

    if (app.Environment.IsDevelopment())
    {
        context.Database.Migrate();

        // Seed development data
        var authService = scope.ServiceProvider.GetRequiredService<IAuthService>();
        DbSeeder.SeedDevelopmentData(context, authService);
    }
}

await app.RunAsync();
