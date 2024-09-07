using Microsoft.EntityFrameworkCore;

namespace AreaPlanner.Data.Sql;

public class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : DbContext(options)
{
    public DbSet<Project> Projects { get; set; }

    protected override void OnModelCreating(ModelBuilder bldr)
    {
        base.OnModelCreating(bldr);
    }
}