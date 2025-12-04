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

// configure routing and swagger
builder.Services.AddControllers(options => { options.Filters.Add<ValidationFilter>(); });
builder.Services.AddSwaggerGen();

// configure validation
builder.Services.AddValidatorsFromAssemblyContaining<Program>();

// configure data source
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("Todo")));

// configure auth
builder.Services
    .AddOptions<JwtOptions>()
    .Bind(builder.Configuration.GetSection("Jwt"));
builder.Services.ConfigureOptions<ConfigureJwtBearerOptions>();
builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer();
builder.Services.AddAuthorization();

// configure CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("TodoApp", policy =>
    {
        // TODO: add this into config
        policy.WithOrigins("http://localhost:5173", "http://localhost:3000")
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

// register services
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<ITodoService, TodoService>();

var app = builder.Build();

// serve swagger in dev only
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// configure the HTTP request pipeline
app.UseHttpsRedirection();
app.UseMiddleware<ExceptionHandlerMiddleware>();
app.UseCors("TodoApp");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

// apply database migrations
if (app.Environment.IsDevelopment())
{
    using var scope = app.Services.CreateScope();
    var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();

    context.Database.Migrate();
    // Seed development data
    var authService = scope.ServiceProvider.GetRequiredService<IAuthService>();
    DbSeeder.SeedDevelopmentData(context, authService);
}

await app.RunAsync();