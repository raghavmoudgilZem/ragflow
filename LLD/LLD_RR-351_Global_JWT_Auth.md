# LLD: RR-351 - Global JWT Auth (API Gateway)

**Component:** `api-gateway`
**Task:** Develop Global JWT Authentication Guard

---

## 1. Objective

Add a global JWT authentication guard to the API Gateway. All incoming requests must be cryptographically validated before YARP proxies them to downstream microservices.

## 2. Scope

* **In Scope:** `JwtBearer` middleware setup, global fallback policy (deny anonymous by default), YARP public route bypass.
* **Out of Scope:** RBAC/Roles, header propagation downstream (handled in RR-352).

## 3. Request Flow

1. Request hits `api-gateway`.
2. JWT middleware validates token signature, expiration, and issuer.
3. Global policy checks if the user is authenticated.
4. If valid -> YARP proxies downstream.
5. If missing/invalid -> Short-circuits with `401 Unauthorized`.
6. If public route (e.g., login) -> YARP config bypasses auth entirely.

## 4. Implementation

### 4.1. Packages

Add to `api-gateway.csproj`:

```xml
<PackageReference Include="Microsoft.AspNetCore.Authentication.JwtBearer" Version="[Your_Target_Version]" />

```

### 4.2. Configuration (`appsettings.json`)

Add JWT settings and update YARP routes to allow anonymous access for specific public endpoints.

```json
{
  "JwtSettings": {
    "Issuer": "https://identity-service",
    "Audience": "rag-api",
    "SecretKey": "" // To be injected via env variables
  },
  "ReverseProxy": {
    "Routes": {
      "auth-route": {
        "ClusterId": "identity-cluster",
        "Match": { "Path": "/api/auth/{**catch-all}" },
        "AuthorizationPolicy": "Anonymous" // Bypasses global auth for login/register
      }
    }
  }
}

```

### 4.3. Pipeline Setup (`Program.cs`)

Register JWT services and set the global fallback policy.

```csharp
// 1. JWT Bearer Auth
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options => 
    {
        // ... Standard TokenValidationParameters mapped from JwtSettings ...
    });

// 2. Enforce Globally
builder.Services.AddAuthorization(options =>
{
    options.FallbackPolicy = new AuthorizationPolicyBuilder()
        .RequireAuthenticatedUser()
        .Build();
});

```

**Middleware Order:**
Ensure auth middlewares are registered immediately before YARP mapping.

```csharp
app.UseRouting();

// Auth must sit exactly here
app.UseAuthentication(); 
app.UseAuthorization();  

app.MapReverseProxy();

```

## 5. Security & Testing

* **Secrets:** Ensure `SecretKey` is not hardcoded. Load via `Environment.GetEnvironmentVariable`.
* **Testing Scenarios:**
* No token -> Expect `401`
* Expired token / bad signature -> Expect `401`
* Hit `/api/auth/...` without token -> Expect successful routing (Anonymous bypass)
* Valid token -> Proxied successfully to downstream service.