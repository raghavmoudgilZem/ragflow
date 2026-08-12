# API Reference

This page documents HTTP API routes for the Identity Service using **only** the routes recorded in the ground-truth facts pack (`FACTS.md`). Per project documentation rules, no route path may be stated unless it appears verbatim in that file.

## Source of truth

Routes are extracted from:

`backend/node-services/identity-service/docs/facts/FACTS.md` — **API Routes** section [src: backend/node-services/identity-service/docs/facts/FACTS.md:L19-L21]

## Documented routes

The `FACTS.md` API Routes table currently contains a header row only and **no route entries**:

| Method | Path | Source Location |
|---|---|---|

Because no method/path pairs are present in `FACTS.md`, **no API endpoints are documented on this page**.

## How to extend this reference

When the facts pack is regenerated and populated with route rows, each entry should be documented here with:

1. **Method** and **Path** — copied exactly from `FACTS.md`
2. **Source Location** — the file reference from the facts table
3. **Behavior** — inferred from the cited controller/handler, with `[src: ...]` anchors

Do not add routes from controller source code until they appear in `FACTS.md`.

## ⚠️ To Verify

- [ ] Regenerate `FACTS.md` so the API Routes table includes all handlers (e.g., auth, users, tenants, and app controllers found in `src/`) before this reference can be completed.
- [ ] Confirm whether Swagger at `/api/docs` should be listed as a documented route or excluded from the facts pack [src: backend/node-services/identity-service/src/main.ts:L36].
- [ ] Confirm the expected global API prefix and versioning scheme (`/api`, URI versioning) against the facts pack once routes are added [src: backend/node-services/identity-service/src/main.ts:L19-L23].
