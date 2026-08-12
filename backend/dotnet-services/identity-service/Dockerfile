# Build stage
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build

WORKDIR /src

# Copy source
COPY . .

# Restore packages
RUN dotnet restore Ragflow.Identity.API/Ragflow.Identity.API.csproj

# Publish application
RUN dotnet publish Ragflow.Identity.API/Ragflow.Identity.API.csproj \
    -c Release \
    -o /app/publish \
    /p:UseAppHost=false

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime

WORKDIR /app

COPY --from=build /app/publish .

# Configure ASP.NET Core
ENV ASPNETCORE_URLS=http://+:3000
ENV ASPNETCORE_ENVIRONMENT=Development

EXPOSE 3000

ENTRYPOINT ["dotnet", "Ragflow.Identity.API.dll"]