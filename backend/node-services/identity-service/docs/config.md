# Configuration

Environment variables for the Identity Service are defined exclusively by the ground-truth facts pack. Only variables listed in `FACTS.md` appear on this page.

## Source of truth

`backend/node-services/identity-service/docs/facts/FACTS.md` — **Extracted Environment / Config Keys** section [src: backend/node-services/identity-service/docs/facts/FACTS.md:L38-L48]

## Environment variables

| Variable | Listed in FACTS.md | Usage in service |
|---|---|---|
| `DATABASE_URL` | `process.env.DATABASE_URL` | MySQL/MariaDB connection string consumed by `PrismaService` on startup; service throws if undefined [src: backend/node-services/identity-service/docs/facts/FACTS.md:L45] [src: backend/node-services/identity-service/src/prisma/prisma.service.ts:L11-L15] |
| `FRONTEND_URL` | `process.env.FRONTEND_URL` | CORS allowed origin for browser clients [src: backend/node-services/identity-service/docs/facts/FACTS.md:L44] [src: backend/node-services/identity-service/src/main.ts:L11-L15] |
| `JWT_ACCESS_EXPIRATION` | `process.env.JWT_ACCESS_EXPIRATION` | Access-token signing expiration passed to `JwtModule` [src: backend/node-services/identity-service/docs/facts/FACTS.md:L42] [src: backend/node-services/identity-service/src/auth/auth.module.ts:L12-L13] |
| `JWT_SECRET` | `process.env.JWT_SECRET` | Secret for signing and verifying JWT access tokens; required at strategy construction [src: backend/node-services/identity-service/docs/facts/FACTS.md:L41] [src: backend/node-services/identity-service/src/auth/auth.module.ts:L12] [src: backend/node-services/identity-service/src/auth/jwt.strategy.ts:L18-L21] |
| `NODE_ENV` | `process.env.NODE_ENV` | When set to `production`, refresh-token cookies use the `secure` flag [src: backend/node-services/identity-service/docs/facts/FACTS.md:L39] [src: backend/node-services/identity-service/src/auth/auth.controller.ts:L24] [src: backend/node-services/identity-service/src/auth/auth.controller.ts:L102] |
| `PORT` | `process.env.PORT` | HTTP listen port for the NestJS application [src: backend/node-services/identity-service/docs/facts/FACTS.md:L44] [src: backend/node-services/identity-service/src/main.ts:L38-L39] |
| `REDIS_HOST` | `process.env.REDIS_HOST` | Redis server hostname [src: backend/node-services/identity-service/docs/facts/FACTS.md:L46] [src: backend/node-services/identity-service/src/redis/redis.module.ts:L11] |
| `REDIS_PASSWORD` | `process.env.REDIS_PASSWORD` | Redis authentication password [src: backend/node-services/identity-service/docs/facts/FACTS.md:L48] [src: backend/node-services/identity-service/src/redis/redis.module.ts:L13] |
| `REDIS_PORT` | `process.env.REDIS_PORT` | Redis server port [src: backend/node-services/identity-service/docs/facts/FACTS.md:L47] [src: backend/node-services/identity-service/src/redis/redis.module.ts:L12] |
| `REFRESH_COOKIE_MAX_AGE` | `process.env.REFRESH_COOKIE_MAX_AGE` | `maxAge` (milliseconds) for the HTTP-only `refresh_token` cookie [src: backend/node-services/identity-service/docs/facts/FACTS.md:L40] [src: backend/node-services/identity-service/src/auth/auth.controller.ts:L27] |

## Variable checklist

Use this checklist when configuring a deployment. Every name must match `FACTS.md` exactly:

- [ ] `DATABASE_URL`
- [ ] `FRONTEND_URL`
- [ ] `JWT_ACCESS_EXPIRATION`
- [ ] `JWT_SECRET`
- [ ] `NODE_ENV`
- [ ] `PORT`
- [ ] `REDIS_HOST`
- [ ] `REDIS_PASSWORD`
- [ ] `REDIS_PORT`
- [ ] `REFRESH_COOKIE_MAX_AGE`

## ⚠️ To Verify

- [ ] Default/fallback values used in code when variables are unset (e.g., `FRONTEND_URL`, `PORT`, `REDIS_HOST`, `REDIS_PORT`, `REFRESH_COOKIE_MAX_AGE`) are not recorded in `FACTS.md` and are therefore omitted from this page [src: backend/node-services/identity-service/src/main.ts:L12] [src: backend/node-services/identity-service/src/main.ts:L38] [src: backend/node-services/identity-service/src/redis/redis.module.ts:L11-L12] [src: backend/node-services/identity-service/src/auth/auth.controller.ts:L27].
- [ ] Refresh-token JWT expiry is hard-coded to `7d` in `AuthService` and is not represented as an environment variable in `FACTS.md` [src: backend/node-services/identity-service/src/auth/auth.service.ts:L96-L98].
- [ ] Redis refresh-token TTL is hard-coded to seven days in `RedisService` and is not represented as an environment variable in `FACTS.md` [src: backend/node-services/identity-service/src/redis/redis.service.ts:L10].
