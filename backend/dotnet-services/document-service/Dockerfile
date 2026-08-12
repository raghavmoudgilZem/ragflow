# Base runtime image
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
WORKDIR /app
EXPOSE 8080

ENV ASPNETCORE_URLS=http://+:8080

# Build image
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy project files
COPY ["src/Document.API/Document.API.csproj", "src/Document.API/"]
COPY ["src/Document.Application/Document.Application.csproj", "src/Document.Application/"]
COPY ["src/Document.Domain/Document.Domain.csproj", "src/Document.Domain/"]
COPY ["src/Document.Infrastructure/Document.Infrastructure.csproj", "src/Document.Infrastructure/"]

# Restore dependencies
RUN dotnet restore "src/Document.API/Document.API.csproj"

# Copy remaining source code
COPY . .

WORKDIR "/src/src/Document.API"

# Build
RUN dotnet build "Document.API.csproj" -c Release -o /app/build

# Publish
FROM build AS publish
RUN dotnet publish "Document.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Final image
FROM base AS final
WORKDIR /app

COPY --from=publish /app/publish .

ENTRYPOINT ["dotnet", "Document.API.dll"]