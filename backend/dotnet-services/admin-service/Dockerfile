# ==========================================
# Build Stage
# ==========================================
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build

WORKDIR /src

# Copy entire source
COPY . .

# Restore packages
RUN dotnet restore AdminService.API/AdminService.API.csproj

# Publish application
RUN dotnet publish AdminService.API/AdminService.API.csproj \
    -c Release \
    -o /app/publish \
    /p:UseAppHost=false

# ==========================================
# Runtime Stage
# ==========================================
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime

WORKDIR /app

COPY --from=build /app/publish .

# ASP.NET Core settings
ENV ASPNETCORE_URLS=http://+:3000
ENV ASPNETCORE_ENVIRONMENT=Development

EXPOSE 3000

ENTRYPOINT ["dotnet", "AdminService.API.dll"]