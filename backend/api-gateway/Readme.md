# 🚪 RAGFlow API Gateway (YARP + Service Discovery)

Welcome to the central API Gateway for the RAGFlow backend ecosystem. 

This service acts as the single entry point for all frontend and client requests, seamlessly routing them to our underlying polyglot microservices (.NET, Node.js, and Java). 

---

## 🧠 Core Concepts: How It Works Behind the Scenes

Our gateway is built on **.NET 10** using **YARP (Yet Another Reverse Proxy)** and **Microsoft.Extensions.ServiceDiscovery**. Here is exactly how traffic flows through the system:

1. **The Request:** The frontend makes a request to a single endpoint (e.g., `http://localhost:8000/api/v1/dataset`). 
2. **YARP Routing (The Traffic Cop):** YARP intercepts the request. It looks at the `appsettings.json` file to match the URL path (`/api/v1/dataset`) to a specific **Cluster** (e.g., `DatasetCluster`).
3. **Dynamic Service Discovery (The Address Book):** YARP does *not* use hardcoded IP addresses. Instead, it asks the Service Discovery resolver: *"Where is the dataset-service?"* Because we run inside `docker-compose`, the resolver uses Docker's internal DNS to instantly find the live, internal IP address of that specific container.
4. **Proxying & Zero-Trust Auth:** YARP seamlessly forwards the entire HTTP request—including the body and the `Authorization: Bearer <token>` header—to the downstream service. **The Gateway does not validate tokens.** Each individual microservice extracts the token and enforces its own authentication and role-based access.

---

## ⚙️ Implementation Details

If you need to view or modify the core implementation, the gateway relies on two primary packages:
* `Yarp.ReverseProxy`
* `Microsoft.Extensions.ServiceDiscovery.Yarp`

The entire mechanism is wired up in `Program.cs` with just a few lines of code:
```csharp
// Registers the dynamic DNS resolver
builder.Services.AddServiceDiscovery(); 

// Wires up YARP and attaches the discovery resolver
builder.Services.AddReverseProxy()
    .LoadFromConfig(builder.Configuration.GetSection("ReverseProxy"))
    .AddServiceDiscoveryDestinationResolver(); 
```

---

## 🛠️ Developer Guide: How to Add Your Microservice

If you are developing a new microservice (e.g., inside `node-services` or `java-services`), you must configure the gateway to route traffic to it. **No C# code changes are required.** You only need to edit `appsettings.json`.

### Configuration Syntax

> **⚠️ CRITICAL PORT WARNING:** Do **not** use `localhost` or the external host port in the `Address` field. You must use the exact container name defined in `docker-compose.yml` and the **internal** port the app listens on inside the container (e.g., `.NET` usually 3000/8080, `Node` usually 3000/4000, `Java` usually 8080).

```json
"ReverseProxy": {
  "Routes": {
    "YourServiceRoute": {
      "ClusterId": "YourServiceCluster",
      // CRITICAL: The {**catch-all} wildcard ensures sub-paths are forwarded
      "Match": { "Path": "/api/v1/your-service/{**catch-all}" }
    }
  },
  "Clusters": {
    "YourServiceCluster": {
      "Destinations": {
        "your-service-container": {
          // Uses Docker Service Discovery to resolve the container name dynamically
          "Address": "http://your-service-container:8080" 
        }
      }
    }
  }
}
```

---

## 🚀 Running & Testing the Gateway

The API Gateway is integrated into the global `docker-compose.yml`.

**1. Start the gateway and your required services:**
```bash
# Navigate to the root folder where docker-compose.yml lives
docker compose up -d --build api-gateway identity-service your-service-name
```

**2. Watch the live traffic logs (Highly recommended for debugging):**
```bash
docker compose logs -f api-gateway
```

**3. Test the full flow (Login -> Fetch Data):**
First, hit the Identity service through the Gateway (Port 8000) to get your Bearer Token:
```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{ "email": "user@example.com", "password": "Password123!" }'
```

Next, use that token to hit your downstream service through the Gateway:
```bash
curl -X GET http://localhost:8000/api/v1/your-service/data \
  -H "Authorization: Bearer <YOUR_ACCESS_TOKEN>"
```

---

## 🐛 Troubleshooting

* **Gateway returns `404 Not Found`:** YARP doesn't recognize your route. Check `appsettings.json` for typos and ensure you included the `{**catch-all}` wildcard.
* **Gateway returns `502 Bad Gateway`:** YARP matched the route but could not reach the container. Verify your destination `Address` uses the correct container name, ensure the internal port is correct, and confirm your service is actually running (`docker ps`).