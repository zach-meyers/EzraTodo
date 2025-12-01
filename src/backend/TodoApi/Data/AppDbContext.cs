using Microsoft.EntityFrameworkCore;
using TodoApi.Models;

namespace TodoApi.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users { get; set; }
    public DbSet<TodoItem> TodoItems { get; set; }
    public DbSet<TodoItemTag> TodoItemTags { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure User entity
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Email).IsUnique();
            entity.Property(e => e.Email).IsRequired();
            entity.Property(e => e.PasswordHash).IsRequired();
        });

        // Configure TodoItem entity
        modelBuilder.Entity<TodoItem>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired();
            entity.Property(e => e.DueDate).IsRequired();

            entity.HasOne(e => e.User)
                .WithMany(u => u.Todos)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Configure TodoItemTag entity
        modelBuilder.Entity<TodoItemTag>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Tag).IsRequired();

            entity.HasOne(e => e.TodoItem)
                .WithMany(t => t.TodoItemTags)
                .HasForeignKey(e => e.TodoItemId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
