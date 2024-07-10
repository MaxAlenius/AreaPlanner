var builder = DistributedApplication.CreateBuilder(args);

var apiService = builder.AddProject<Projects.AreaPlanner_ApiService>("apiservice");

builder.AddProject<Projects.AreaPlanner_Web>("webfrontend")
    .WithExternalHttpEndpoints()
    .WithReference(apiService);

builder.Build().Run();
