# Rag

A full-stack application for managing Your own knowledge graph and build your own rag system.

## Project Structure

```
rag/
├── frontend/                                # Frontend applications
│   ├── angular/                             # Angular app
│   └── react/                               # React + Vite app
├── backend/                                 # Backend services
│   ├── api-gateway/                         # .NET YARP gateway (auth, rate limiting, audit logging)
│   ├── dotnet-services/                     # .NET microservices
│   │   ├── admin-service/
│   │   ├── document-service/
│   │   ├── file-service/
│   │   ├── identity-service/
│   │   └── knowledgebase-service/
│   ├── java-services/                       # Spring Boot microservices (maven multi-module)
│   │   ├── dashboard-service/
│   │   ├── dataset-service/
│   │   ├── document-service/
│   │   ├── file-service/
│   │   ├── identity-service/
│   │   ├── notification/
│   │   ├── retrieval-service/
│   │   └── search-service/
│   ├── node-services/                       # Node.js / NestJS microservices
│   │   ├── admin-service/
│   │   ├── chat-service/
│   │   ├── connector-service/
│   │   ├── dataset-service/
│   │   ├── document-service/
│   │   ├── file-service/
│   │   ├── identity-service/
│   │   ├── llm-config-service/
│   │   ├── llm-gateway-service/
│   │   ├── notification-service/
│   │   ├── parser-service/
│   │   └── search-service/
│   └── shared/                              # Shared cross-service config (services.json)
├── docker/                                  # Docker compose stacks and DB init scripts
│   ├── docker-compose-base.yml              # Infrastructure (DB, Redis, MinIO, ...)
│   ├── docker-compose.yml                   # Application services
│   ├── init.sql                             # MySQL init script
│   ├── pg_init.sql                          # PostgreSQL init script
│   └── .env.example
├── mock-server/                             # Mock API server for local frontend development
├── LLD/                                     # Low-level design documents
├── ragflow-automation/                      # Selenium + TestNG automation suite (legacy)
├── ragflow-automation-rearchitecture/       # Re-architected automation suites
│   ├── selenium-csharp/                     # C# / NUnit UI tests
│   └── selenium-testng-java/                # Java / TestNG UI tests
├── data/                                    # Local data files (mock-server SQLite db)
├── .gitignore                               # Git ignore file
└── README.md
```

## Tech Stack

### Backend

- **NestJS** - Progressive Node.js framework
- **Prisma** - Next-generation ORM
- **PostgreSQL** - Relational database
- **Redis** - Caching and queuing
- **MinIO** - Object storage
- **Bull** - Queue management
- **Swagger** - API documentation

### Frontend

- **Angular 17+** - Modern web framework
- **TypeScript** - Type-safe JavaScript
- **RxJS** - Reactive programming
- **Angular Material** - UI components

## Prerequisites

- Node.js 18+
- Docker & Docker Compose
- npm or yarn

## Quick Start

### 1. Clone and Setup

```bash
cd rag
```

### 2. Backend Setup

```bash
cd dataset-service

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install
```

### 4. Run with Docker

```bash
# From project root
docker-compose up -d
```

This will start:

- Mysql (port 3306)
- Redis (port 6379)
- MinIO (port 9000, console 9001)
- Backend API (port 3000)
- Frontend (port 4200)

### 5. Access Applications

- **Frontend**: http://localhost:4200
- **Backend API**: http://localhost:3000
- **API Documentation**: http://localhost:3000/api/docs
- **MinIO Console**: http://localhost:9001

## Docker Compose Commands

### Basic Commands

```bash
# Start all services in detached mode
docker-compose up -d

# Start all services with logs
docker-compose up

# Stop all services
docker-compose down

# Stop and remove volumes (WARNING: deletes all data)
docker-compose down -v

# View logs of all services
docker-compose logs

# View logs of specific service
docker-compose logs dataset-service
docker-compose logs mysql

# Follow logs in real-time
docker-compose logs -f

# Restart all services
docker-compose restart

# Restart specific service
docker-compose restart dataset-service

# View running containers
docker-compose ps

# Build or rebuild services
docker-compose build

# Build without cache
docker-compose build --no-cache

# Pull latest images
docker-compose pull

# Execute command in running container
docker-compose exec dataset-service npm run prisma:migrate
docker-compose exec mysql mysql -u root -p

# Scale a service (if supported)
docker-compose up -d --scale dataset-service=3

# View resource usage
docker-compose stats
```

### Useful Workflows

```bash
# Rebuild and restart a specific service
docker-compose up -d --build dataset-service

# View last 100 lines of logs
docker-compose logs --tail=100

# Remove stopped containers
docker-compose rm

# Validate docker-compose.yml
docker-compose config

# Stop services without removing containers
docker-compose stop
```

## Development

### Backend Development

```bash
cd dataset-service

# Run in development mode
npm run start:dev

# Run tests
npm run test

# Lint
npm run lint
```

### Frontend Development

```bash
cd web

# Serve with hot reload
npm run start

# Build for production
npm run build

# Run tests
npm run test
```

```env
NODE_ENV=development
PORT=3000

# Database
DATABASE_URL=postgresql://dataset_user:dataset_password@localhost:5432/dataset_db

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# MinIO
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_USE_SSL=false
MINIO_BUCKET_NAME=datasets

```

## Folder Structure to follow

dataset-service/
├── package.json
├── tsconfig.json
├── nest-cli.json
├── .env
├── Dockerfile
├── src/
│ ├── main.ts
│ ├── app.module.ts
│ ├── config/
│ │ ├── config.module.ts
│ │ ├── database.config.ts
│ │ ├── redis.config.ts
│ │ ├── storage.config.ts
│ │ └── queue.config.ts
│ ├── common/
│ │ ├── decorators/
│ │ │ ├── auth.decorator.ts
│ │ │ ├── tenant.decorator.ts
│ │ │ └── api-version.decorator.ts
│ │ ├── filters/
│ │ │ └── http-exception.filter.ts
│ │ ├── guards/
│ │ │ ├── auth.guard.ts
│ │ │ └── permission.guard.ts
│ │ ├── interceptors/
│ │ │ ├── logging.interceptor.ts
│ │ │ ├── transform.interceptor.ts
│ │ │ └── file-upload.interceptor.ts
│ │ ├── pipes/
│ │ │ └── validation.pipe.ts
│ │ └── interfaces/
│ │ ├── response.interface.ts
│ │ └── pagination.interface.ts
│ ├── modules/
│ │ ├── dataset/
│ │ │ ├── dataset.module.ts
│ │ │ ├── dataset.controller.ts
│ │ │ ├── dataset.service.ts
│ │ │ ├── dto/
│ │ │ │ ├── create-dataset.dto.ts
│ │ │ │ ├── update-dataset.dto.ts
│ │ │ │ ├── list-dataset.dto.ts
│ │ │ │ └── delete-dataset.dto.ts
│ │ │ ├── entities/
│ │ │ │ └── dataset.entity.ts
│ │ │ └── repositories/
│ │ │ └── dataset.repository.ts
│ │ │
│ │ ├── document/ # ← Document module under dataset
│ │ │ ├── document.module.ts
│ │ │ ├── document.controller.ts
│ │ │ ├── document.service.ts
│ │ │ ├── dto/
│ │ │ │ ├── create-document.dto.ts
│ │ │ │ ├── update-document.dto.ts
│ │ │ │ ├── list-document.dto.ts
│ │ │ │ └── parse-document.dto.ts
│ │ │ ├── entities/
│ │ │ │ └── document.entity.ts
│ │ │ └── repositories/
│ │ │ └── document.repository.ts
│ │ │
│ │ ├── upload/ # ← Upload module for file handling
│ │ │ ├── upload.module.ts
│ │ │ ├── upload.controller.ts
│ │ │ ├── upload.service.ts
│ │ │ ├── dto/
│ │ │ │ └── upload-file.dto.ts
│ │ │ └── interceptors/
│ │ │ └── file-validation.interceptor.ts
│ │ │
│ │ ├── chunk/ # ← Chunk module
│ │ │ ├── chunk.module.ts
│ │ │ ├── chunk.controller.ts
│ │ │ ├── chunk.service.ts
│ │ │ ├── dto/
│ │ │ │ ├── create-chunk.dto.ts
│ │ │ │ ├── update-chunk.dto.ts
│ │ │ │ └── list-chunk.dto.ts
│ │ │ ├── entities/
│ │ │ │ └── chunk.entity.ts
│ │ │ └── repositories/
│ │ │ └── chunk.repository.ts
│ │ │
│ │ ├── knowledge-graph/
│ │ │ ├── knowledge-graph.module.ts
│ │ │ ├── knowledge-graph.controller.ts
│ │ │ ├── knowledge-graph.service.ts
│ │ │ └── dto/
│ │ │ ├── run-graphrag.dto.ts
│ │ │ └── run-raptor.dto.ts
│ │ │
│ │ └── auth/
│ │ ├── auth.module.ts
│ │ ├── auth.service.ts
│ │ └── strategies/
│ │ └── jwt.strategy.ts
│ │
│ ├── infrastructure/ # ← Infrastructure layer
│ │ ├── database/
│ │ │ ├── database.module.ts
│ │ │ ├── database.service.ts
│ │ │ └── prisma.service.ts
│ │ │
│ │ ├── storage/ # ← Storage module (MinIO)
│ │ │ ├── storage.module.ts
│ │ │ ├── storage.service.ts
│ │ │ └── providers/
│ │ │ ├── minio.provider.ts
│ │ │ └── s3.provider.ts
│ │ │
│ │ └── queue/ # ← Queue module for async tasks
│ │ ├── queue.module.ts
│ │ ├── queue.service.ts
│ │ └── producers/
│ │ ├── parsing.producer.ts
│ │ └── indexing.producer.ts
│ │
│ ├── health/
│ │ ├── health.module.ts
│ │ └── health.controller.ts
│ │
│ └── utils/
│ ├── logger.ts
│ ├── response.helper.ts
│ └── file.helper.ts
│
├── prisma/
│ ├── schema.prisma
│ └── migrations/
│
└── test/
├── unit/
└── e2e/

### Backend Architecture

```
┌─────────────────┐
│   Controllers   │
└────────┬────────┘
         │
┌────────▼────────┐
│    Services     │
└────────┬────────┘
         │
┌────────▼────────┐
│  Repositories   │
└────────┬────────┘
         │
┌────────▼────────┐
│     Prisma      │
└────────┬────────┘
         │
┌────────▼────────┐
│      MySql      │
└─────────────────┘
```

## Testing

### Backend Tests

```bash
cd dataset-service

# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Coverage
npm run test:cov
```

### Frontend Tests

```bash
cd web

# Unit tests
npm run test

# E2E tests
npm run e2e
```

## Deployment

### Production Build

```bash
# Backend
cd dataset-service
npm run build

# Frontend
cd web
npm run build
```

### Docker Production

```bash
docker-compose -f docker-compose.yml up -d
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License

## Support

For issues and questions, please open an issue on GitHub.
