using AreaPlanner.Common.Data;
using Microsoft.EntityFrameworkCore;

namespace AreaPlanner.Data.Sql;

internal class ProjectRepository(ApplicationDbContext dbContext) : IProjectRepository
{
    public async Task GetProjectAsync()
    {
        var project = await dbContext.Projects.FirstOrDefaultAsync();
    }
}
