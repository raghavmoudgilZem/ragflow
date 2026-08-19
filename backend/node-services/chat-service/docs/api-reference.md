# API Reference

This page documents HTTP API routes for the Chat Service using **only** the routes recorded in the ground-truth facts pack (`FACTS.md`). Per project documentation rules, no route path may be stated unless it appears verbatim in that file.

## Source of truth

Routes are extracted from:

`backend/node-services/chat-service/docs/facts/FACTS.md` — **Extracted API Routes** section [src: backend/node-services/chat-service/docs/facts/FACTS.md:L16-L17]

## Documented routes

`FACTS.md` reports:

> _No explicit HTTP annotations detected._

Because no method/path pairs are present in `FACTS.md`, **no API endpoints are documented on this page**.

## Expected modules (pending facts extraction)

The facts extractor currently matches NestJS `@Get` / `@Post` decorators only. Express route handlers exist in these files but are not yet captured in `FACTS.md`:

| Module | Route file |
|---|---|
| Conversation | `src/modules/conversation/conversation.routes.ts` |
| Dialog | `src/modules/dialog/dialog.routes.ts` |
| Messages | `src/modules/messages/messages.routes.ts` |
| Chat Engine | `src/modules/chat-engine/chat-engine.routes.ts` |
| Multi-Model | `src/modules/multi-model/multi-model.routes.ts` |
| Health | `src/app.ts` |

## How to extend this reference

When the facts pack is regenerated with Express route support:

1. Copy each route entry exactly from `FACTS.md`.
2. Add behavior descriptions with `[src: ...]` citations to the matching controller/handler.
3. Do not add routes from source code that are missing from `FACTS.md`.

## ⚠️ To Verify

- [ ] Extend `tools/extract-facts.mjs` to parse Express patterns (`router.get`, `router.post`, `app.get`, etc.) for `node-services` projects.
- [ ] Regenerate `FACTS.md` and backfill this page with the extracted route list.
- [ ] Confirm mount prefixes from the central router aggregator once routes appear in `FACTS.md` [src: backend/node-services/chat-service/src/core/routes/index.ts:L10-L14].
