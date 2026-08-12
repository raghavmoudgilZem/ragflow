# ----------------------------
# Build Stage
# ----------------------------
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build

WORKDIR /src

COPY . .

RUN dotnet restore Ragflow.FileService.API/Ragflow.FileService.API.csproj

RUN dotnet publish Ragflow.FileService.API/Ragflow.FileService.API.csproj \
    -c Release \
    -o /app/publish \
    /p:UseAppHost=false

# ----------------------------
# Runtime Stage
# ----------------------------
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final

WORKDIR /app

COPY --from=build /app/publish .

EXPOSE 8080
EXPOSE 8081

ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Development

ENTRYPOINT ["dotnet", "Ragflow.FileService.API.dll"]