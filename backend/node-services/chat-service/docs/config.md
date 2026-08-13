# Configuration

Environment variables and configuration keys for the Chat Service are defined exclusively by the ground-truth facts pack. Only keys listed in `FACTS.md` appear on this page.

## Source of truth

`backend/node-services/chat-service/docs/facts/FACTS.md` — **Extracted Environment / Config Keys** section [src: backend/node-services/chat-service/docs/facts/FACTS.md:L10-L11]

## Environment variables

`FACTS.md` reports:

> _No explicit environment variables detected._

Because no configuration keys are present in `FACTS.md`, **no environment variables are documented on this page**.

## Configuration checklist

Use this checklist after `FACTS.md` is regenerated. Variable names must match the facts pack exactly — do not add names from source code until they appear in `FACTS.md`.

- [ ] _(pending facts extraction)_

## ⚠️ To Verify

- [ ] Re-run fact extraction after fixing stack detection; the current `FACTS.md` was generated with `JAVA_SPRING_BOOT` logic and captured zero config keys [src: backend/node-services/chat-service/docs/facts/FACTS.md:L4-L11].
- [ ] Source code references `process.env.PORT`, `process.env.DATABASE_URL_CHAT`, and `process.env.NODE_ENV`, but none appear in `FACTS.md` and are therefore omitted [src: backend/node-services/chat-service/src/server.ts:L4] [src: backend/node-services/chat-service/src/core/database/index.ts:L16] [src: backend/node-services/chat-service/src/core/database/index.ts:L39].
- [ ] `.env.example` lists `DATABASE_URL` and `PORT`, which are not present in `FACTS.md` [src: backend/node-services/chat-service/.env.example:L1-L2].
- [ ] Align `.env.example` with runtime variable names (e.g., `DATABASE_URL` vs `DATABASE_URL_CHAT`) before the next facts extraction run.
