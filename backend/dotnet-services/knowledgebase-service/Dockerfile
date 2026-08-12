# Base runtime image
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
WORKDIR /app
EXPOSE 8080

ENV ASPNETCORE_URLS=http://+:8080

# Build image
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy project files
COPY ["src/KnowledgeBase.API/KnowledgeBase.API.csproj", "src/KnowledgeBase.API/"]
COPY ["src/KnowledgeBase.Application/KnowledgeBase.Application.csproj", "src/KnowledgeBase.Application/"]
COPY ["src/KnowledgeBase.Domain/KnowledgeBase.Domain.csproj", "src/KnowledgeBase.Domain/"]
COPY ["src/KnowledgeBase.Infrastructure/KnowledgeBase.Infrastructure.csproj", "src/KnowledgeBase.Infrastructure/"]

# Restore dependencies
RUN dotnet restore "src/KnowledgeBase.API/KnowledgeBase.API.csproj"

# Copy remaining source code
COPY . .

WORKDIR "/src/src/KnowledgeBase.API"

# Build
RUN dotnet build "KnowledgeBase.API.csproj" -c Release -o /app/build

# Publish
FROM build AS publish
RUN dotnet publish "KnowledgeBase.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Final image
FROM base AS final
WORKDIR /app

COPY --from=publish /app/publish .

ENTRYPOINT ["dotnet", "KnowledgeBase.API.dll"]