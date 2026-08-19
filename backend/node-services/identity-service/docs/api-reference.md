# API Reference

This page documents HTTP API routes for the Identity Service using **only** the routes recorded in the ground-truth facts pack (`FACTS.md`). Route segments appear exactly as extracted from NestJS decorators; full resolved URLs are not stated unless they appear verbatim in `FACTS.md`.

## Source of truth

`backend/node-services/identity-service/docs/facts/FACTS.md` — **Extracted API Routes** section [src: backend/node-services/identity-service/docs/facts/FACTS.md:L28-L36]

---

## Authentication

Controller: `auth` (version `1`) [src: backend/node-services/identity-service/src/auth/auth.controller.ts:L31]

| FACTS entry | Method | Route segment | Description |
|---|---|---|---|
| `@Post('register') in src/auth/auth.controller.ts` | POST | `register` | Register a new user with email and password; returns success message and `userId` [src: backend/node-services/identity-service/docs/facts/FACTS.md:L29] [src: backend/node-services/identity-service/src/auth/auth.controller.ts:L35-L41] |
| `@Post('login') in src/auth/auth.controller.ts` | POST | `login` | Authenticate user, set HTTP-only `refresh_token` cookie, return `access_token` [src: backend/node-services/identity-service/docs/facts/FACTS.md:L30] [src: backend/node-services/identity-service/src/auth/auth.controller.ts:L44-L62] |
| `@Post('refresh') in src/auth/auth.controller.ts` | POST | `refresh` | Rotate tokens using the `refresh_token` cookie; return new `access_token` [src: backend/node-services/identity-service/docs/facts/FACTS.md:L31] [src: backend/node-services/identity-service/src/auth/auth.controller.ts:L65-L85] |
| `@Post('logout') in src/auth/auth.controller.ts` | POST | `logout` | Requires JWT bearer auth; revokes session in Redis and clears refresh cookie [src: backend/node-services/identity-service/docs/facts/FACTS.md:L32] [src: backend/node-services/identity-service/src/auth/auth.controller.ts:L88-L107] |

---

## Tenants

Controller: `tenants` (version `1`) [src: backend/node-services/identity-service/src/tenants/tenant.controller.ts:L25]

| FACTS entry | Method | Route segment | Description |
|---|---|---|---|
| `@Post(':tenantId/users') in src/tenants/tenant.controller.ts` | POST | `:tenantId/users` | Invite or add a user to a tenant; requires JWT and `OWNER` or `ADMIN` tenant role [src: backend/node-services/identity-service/docs/facts/FACTS.md:L33] [src: backend/node-services/identity-service/src/tenants/tenant.controller.ts:L43-L51] |
| `@Patch(':tenantId/users/:userId/role') in src/tenants/tenant.controller.ts` | PATCH | `:tenantId/users/:userId/role` | Update a tenant member's role; requires JWT and `OWNER` tenant role [src: backend/node-services/identity-service/docs/facts/FACTS.md:L34] [src: backend/node-services/identity-service/src/tenants/tenant.controller.ts:L54-L67] |
| `@Delete(':tenantId/users/:userId') in src/tenants/tenant.controller.ts` | DELETE | `:tenantId/users/:userId` | Remove a user from a tenant; requires JWT and `OWNER` or `ADMIN` tenant role [src: backend/node-services/identity-service/docs/facts/FACTS.md:L35] [src: backend/node-services/identity-service/src/tenants/tenant.controller.ts:L70-L78] |

---

## Users

Controller: `users` (version `1`) [src: backend/node-services/identity-service/src/users/users.controller.ts:L21]

| FACTS entry | Method | Route segment | Description |
|---|---|---|---|
| `@Get('profile') in src/users/users.controller.ts` | GET | `profile` | Returns the authenticated user's profile including tenant memberships; requires JWT [src: backend/node-services/identity-service/docs/facts/FACTS.md:L36] [src: backend/node-services/identity-service/src/users/users.controller.ts:L25-L35] |

---

## ⚠️ To Verify

- [ ] `@Post()` tenant creation on `TenantController` exists in source but is missing from `FACTS.md` [src: backend/node-services/identity-service/src/tenants/tenant.controller.ts:L30-L31].
- [ ] `@Get()` root handler on `AppController` exists in source but is missing from `FACTS.md` [src: backend/node-services/identity-service/src/app.controller.ts:L7-L9].
- [ ] Confirm how global prefix, URI versioning, and controller paths combine into full URLs — these composed paths are not in `FACTS.md` [src: backend/node-services/identity-service/src/main.ts:L19-L23].
