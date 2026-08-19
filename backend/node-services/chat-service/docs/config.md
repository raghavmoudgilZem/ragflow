# Configuration

Environment variables for the Chat Service are defined exclusively by the ground-truth facts pack. Only variables listed in `FACTS.md` appear on this page.

## Source of truth

`backend/node-services/chat-service/docs/facts/FACTS.md` — **Extracted Environment / Config Keys** section [src: backend/node-services/chat-service/docs/facts/FACTS.md:L19-L22]

## Environment variables

| Variable | Listed in FACTS.md | Usage in service |
|---|---|---|
| `DATABASE_URL_CHAT` | `process.env.DATABASE_URL_CHAT` | PostgreSQL connection string for the Drizzle ORM connection pool [src: backend/node-services/chat-service/docs/facts/FACTS.md:L20] [src: backend/node-services/chat-service/src/core/database/index.ts:L16] |
| `NODE_ENV` | `process.env.NODE_ENV` | When not `production`, reuses the DB pool singleton across nodemon reloads [src: backend/node-services/chat-service/docs/facts/FACTS.md:L21] [src: backend/node-services/chat-service/src/core/database/index.ts:L39] |
| `PORT` | `process.env.PORT` | HTTP listen port for the Express server [src: backend/node-services/chat-service/docs/facts/FACTS.md:L22] [src: backend/node-services/chat-service/src/server.ts:L4-L7] |

## Variable checklist

Use this checklist when configuring a deployment. Every name must match `FACTS.md` exactly:

- [ ] `DATABASE_URL_CHAT`
- [ ] `NODE_ENV`
- [ ] `PORT`

## ⚠️ To Verify

- [ ] Default fallback for `PORT` (`3009`) is used in code but is not recorded in `FACTS.md` [src: backend/node-services/chat-service/src/server.ts:L4].
- [ ] `.env.example` lists `DATABASE_URL` instead of `DATABASE_URL_CHAT` — reconcile before deployment [src: backend/node-services/chat-service/.env.example:L1] [src: backend/node-services/chat-service/docs/facts/FACTS.md:L20].
- [ ] Additional configuration keys may exist in `.env.example` that are absent from `FACTS.md` [src: backend/node-services/chat-service/.env.example:L1-L2].
