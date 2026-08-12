# Configuration

Environment variables for the Identity Service are defined exclusively by the ground-truth facts pack. Only variables listed in `FACTS.md` appear on this page.

## Source of truth

`backend/node-services/identity-service/docs/facts/FACTS.md` — **Environment Variables** section [src: backend/node-services/identity-service/docs/facts/FACTS.md:L5-L17]

## Environment variables

All variables below are marked as found in code (`✅`) in `FACTS.md`.

| Variable | Found In Code | Usage in service |
|---|---|---|
| `DATABASE_URL` | ✅ | MySQL/MariaDB connection string consumed by `PrismaService` on startup; service throws if undefined [src: backend/node-services/identity-service/docs/facts/FACTS.md:L8] [src: backend/node-services/identity-service/src/prisma/prisma.service.ts:L11-L15] |
| `FRONTEND_URL` | ✅ | CORS allowed origin for browser clients [src: backend/node-services/identity-service/docs/facts/FACTS.md:L9] [src: backend/node-services/identity-service/src/main.ts:L11-L15] |
| `JWT_ACCESS_EXPIRATION` | ✅ | Access-token signing expiration passed to `JwtModule` [src: backend/node-services/identity-service/docs/facts/FACTS.md:L10] [src: backend/node-services/identity-service/src/auth/auth.module.ts:L12-L13] |
| `JWT_SECRET` | ✅ | Secret for signing and verifying JWT access tokens; required at strategy construction [src: backend/node-services/identity-service/docs/facts/FACTS.md:L11] [src: backend/node-services/identity-service/src/auth/auth.module.ts:L12] [src: backend/node-services/identity-service/src/auth/jwt.strategy.ts:L18-L21] |
| `NODE_ENV` | ✅ | When set to `production`, refresh-token cookies use the `secure` flag [src: backend/node-services/identity-service/docs/facts/FACTS.md:L12] [src: backend/node-services/identity-service/src/auth/auth.controller.ts:L24] [src: backend/node-services/identity-service/src/auth/auth.controller.ts:L102] |
| `PORT` | ✅ | HTTP listen port for the NestJS application [src: backend/node-services/identity-service/docs/facts/FACTS.md:L13] [src: backend/node-services/identity-service/src/main.ts:L38-L39] |
| `REDIS_HOST` | ✅ | Redis server hostname [src: backend/node-services/identity-service/docs/facts/FACTS.md:L14] [src: backend/node-services/identity-service/src/redis/redis.module.ts:L11] |
| `REDIS_PASSWORD` | ✅ | Redis authentication password [src: backend/node-services/identity-service/docs/facts/FACTS.md:L15] [src: backend/node-services/identity-service/src/redis/redis.module.ts:L13] |
| `REDIS_PORT` | ✅ | Redis server port [src: backend/node-services/identity-service/docs/facts/FACTS.md:L16] [src: backend/node-services/identity-service/src/redis/redis.module.ts:L12] |
| `REFRESH_COOKIE_MAX_AGE` | ✅ | `maxAge` (milliseconds) for the HTTP-only `refresh_token` cookie [src: backend/node-services/identity-service/docs/facts/FACTS.md:L17] [src: backend/node-services/identity-service/src/auth/auth.controller.ts:L27] |

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
