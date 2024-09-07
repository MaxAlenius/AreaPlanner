using System.ComponentModel.DataAnnotations;

namespace AreaPlanner.Data.Sql;

public class Project
{
    [Key]
    public int Id { get; set; }

    [Required, MaxLength(100)]
    public required string Name { get; set; }
}
