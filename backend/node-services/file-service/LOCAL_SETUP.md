# File Service - Local Setup Guide

## Overview

This document describes how to run the File Service locally using Docker Compose and explains common issues that may occur during development.

---

# Prerequisites

- Node.js 22+
- Docker & Docker Compose
- PostgreSQL 15+
- MinIO (for object storage)
- Git

---

# Running the Service

## Start Infrastructure

Start PostgreSQL:

```bash
docker compose up -d postgres
```

If testing file uploads using MinIO:

```bash
docker compose up -d minio
```

---

## Start File Service

```bash
docker compose up file-service
```

Expected output:

```text
[Nest] LOG [PrismaService] Connected to PostgreSQL
[Nest] LOG [NestApplication] Nest application successfully started
File Service running on port 4005
Swagger: http://localhost:4005/swagger
```

---

# Environment Configuration

## Running Outside Docker

Use localhost because the application runs on the host machine.

```env
DATABASE_URL_FILE=postgresql://postgres:postgres@localhost:5432/rag_file_db
```

---

## Running Inside Docker

Use the Docker service name because containers communicate using Docker DNS.

```env
DATABASE_URL_FILE=postgresql://postgres:postgres@postgres:5432/rag_file_db
```

---

# Docker Networking

Both PostgreSQL and File Service must be connected to the same Docker network.

Example:

```yaml
postgres:
  networks:
    - ragflow

file-service:
  networks:
    - ragflow
```

---

# Common Issues

## Prisma P1001

Example:

```text
PrismaClientInitializationError:
Can't reach database server at postgres:5432
```

### Possible Reasons

- PostgreSQL container is not running.
- PostgreSQL health check has not completed.
- Incorrect database host.
- PostgreSQL and File Service are connected to different Docker networks.

---

## Verify Database

```bash
docker exec -it rag-postgres psql -U postgres -l
```

Expected database:

```
rag_file_db
```

---

## Verify Docker Network

File Service:

```bash
docker inspect rag-file-service --format='{{json .NetworkSettings.Networks}}'
```

PostgreSQL:

```bash
docker inspect rag-postgres --format='{{json .NetworkSettings.Networks}}'
```

Both services must be attached to the same Docker network.

---

## Verify Database URL

```bash
docker exec -it rag-file-service printenv | grep DATABASE_URL_FILE
```

Expected:

```text
DATABASE_URL_FILE=postgresql://postgres:postgres@postgres:5432/rag_file_db
```

---

# Useful Docker Commands

Start services:

```bash
docker compose up -d postgres file-service
```

Restart:

```bash
docker compose restart postgres file-service
```

Recreate containers:

```bash
docker compose up -d --force-recreate postgres file-service
```

View logs:

```bash
docker compose logs -f file-service
```

Enter File Service container:

```bash
docker exec -it rag-file-service sh
```

Enter PostgreSQL container:

```bash
docker exec -it rag-postgres sh
```

---

# Key Learnings

- Use `localhost` only when the application runs on the host machine.
- Use the Docker service name (`postgres`) when the application runs inside a Docker container.
- Docker resolves service names using its internal DNS.
- Containers can communicate using service names only when they are attached to the same Docker network.
- If PostgreSQL and File Service are on different Docker networks, Prisma cannot resolve `postgres`, resulting in a `P1001` connection error.
