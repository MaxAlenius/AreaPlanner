var builder = DistributedApplication.CreateBuilder(args);

var connectionString = builder.AddConnectionString("defaultConnection");
var db = builder.AddSqlServer("database");


var apiService = builder.AddProject<Projects.AreaPlanner_ApiService>("apiservice").WithReference(db).WithReference(connectionString);

builder.AddProject<Projects.AreaPlanner_Web>("webfrontend")
    .WithExternalHttpEndpoints()
    .WithReference(apiService);

builder.Build().Run();
