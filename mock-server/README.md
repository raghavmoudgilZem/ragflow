# RAGFlow Mock Server

**Type:** Node.js + Express.js  
**Status:** Chat services complete

## Quick Start

```bash
cd rag/mock-server
npm install
npm run dev
```

Visit: `http://localhost:4000/health`

## Documentation for CHAT SERVICES (Refer this)

- **Full API Spec:** See `CHAT_API_SPEC.md`
- **6 Endpoints:** List, Create, Rename, Delete (Chats) + List, Create (Conversations)
- **Mock Data:** 3 Chats with conversations pre-loaded

## For Other Services

Create your service file in `src/yourservice/data.ts` & `src/yourservice/handler.ts`, then register in `server.ts`.

Example: `src/chatservice/handler.ts` + register in `server.ts` = done.

Routes are declared bare (`/datasets/...`, `/auth/login`) because `server.ts` mounts the router at `/api/v1`.

## Dataset / Ingestion Services

Read-only mock for the ingestion progress and dataset overview endpoints (documents-with-progress, ingestions summary, ingestion logs).

**Why in-memory instead of SQLite (unlike chat-services):** these endpoints are GET-only, so there is no CRUD state to persist across restarts. Document progress is not stored — it is derived from elapsed time on every request in `getDocumentsSnapshot()` (`data.ts`), so the RUNNING documents advance on their own and one flips to DONE mid-session. This is what makes the polling engine testable against a moving target. A persisted table would freeze progress at the seeded values, and would survive a restart mid-progress, which hides polling bugs (a poller that never terminates looks correct if documents come back already-DONE). The simulation resets cleanly on each server boot. A repository/SQLite layer here would add machinery this mock does not need and would work against the polling scenario it exists to exercise.