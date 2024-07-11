using Microsoft.EntityFrameworkCore;
using Simple_Chat_Application.Entity;

namespace Simple_Chat_Application.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions options) : base(options) { }

        public DbSet<ChatMessage> ChatMessages { get; set; }

    }
}
