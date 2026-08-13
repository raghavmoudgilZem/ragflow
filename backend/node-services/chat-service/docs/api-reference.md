# API Reference

This page documents HTTP API routes for the Chat Service using **only** the routes recorded in the ground-truth facts pack (`FACTS.md`). Per project documentation rules, no route path may be stated unless it appears verbatim in that file.

## Source of truth

Routes are extracted from:

`backend/node-services/chat-service/docs/facts/FACTS.md` — **Extracted API Routes** section [src: backend/node-services/chat-service/docs/facts/FACTS.md:L7-L8]

## Documented routes

`FACTS.md` reports:

> _No explicit HTTP annotations detected._

Because no method/path pairs are present in `FACTS.md`, **no API endpoints are documented on this page**.

## Expected modules (pending facts extraction)

Once `FACTS.md` is regenerated with correct Express route extraction, routes from these modules should appear:

| Module | Route file |
|---|---|
| Conversation | `src/modules/conversation/conversation.routes.ts` |
| Dialog | `src/modules/dialog/dialog.routes.ts` |
| Messages | `src/modules/messages/messages.routes.ts` |
| Chat Engine | `src/modules/chat-engine/chat-engine.routes.ts` |
| Multi-Model | `src/modules/multi-model/multi-model.routes.ts` |
| Health | `src/app.ts` |

These files exist in source but their paths cannot be documented until listed in `FACTS.md`.

## How to extend this reference

When the facts pack is regenerated:

1. Copy each route entry exactly from `FACTS.md`.
2. Add behavior descriptions with `[src: ...]` citations to the matching controller/handler.
3. Do not add routes from source code that are missing from `FACTS.md`.

## ⚠️ To Verify

- [ ] Fix `tools/extract-facts.mjs` stack detection so `node-services/*` with `package.json` is classified as `NODE_NESTJS` (or a dedicated Express profile) and Express `router.get/post/...` patterns are parsed.
- [ ] Regenerate `FACTS.md` and backfill this page with the extracted route list.
- [ ] Confirm the API versioning and mount prefix used by the central router aggregator once routes are in `FACTS.md` [src: backend/node-services/chat-service/src/core/routes/index.ts:L10-L14].
