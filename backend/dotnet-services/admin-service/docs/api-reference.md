# API Reference

This page documents HTTP API routes for the Admin Service using **only** the routes recorded in the ground-truth facts pack (`FACTS.md`). Per project documentation rules, no route path may be stated unless it appears verbatim in that file.

## Source of truth

Routes are extracted from:

`backend/dotnet-services/admin-service/docs/facts/FACTS.md` — **Extracted API Routes** section [src: backend/dotnet-services/admin-service/docs/facts/FACTS.md:L7-L8]

## Documented routes

`FACTS.md` reports:

> _No explicit HTTP annotations detected._

Because no method/path pairs are present in `FACTS.md`, **no API endpoints are documented on this page**.

## Expected controllers (pending facts extraction)

Once `FACTS.md` is regenerated with correct ASP.NET Core attribute parsing, routes from these controllers should appear:

| Controller | File |
|---|---|
| Auth | `AdminService.API/Controllers/AuthController.cs` |
| Users | `AdminService.API/Controllers/UsersController.cs` |
| Monitoring | `AdminService.API/Controllers/MonitoringController.cs` |
| Health checks | `AdminService.API/Program.cs` |

These handlers exist in source but their paths cannot be documented until listed in `FACTS.md`.

## How to extend this reference

When the facts pack is regenerated:

1. Copy each route entry exactly from `FACTS.md`.
2. Add behavior descriptions with `[src: ...]` citations to the matching controller action.
3. Do not add routes from source code that are missing from `FACTS.md`.

## ⚠️ To Verify

- [ ] Fix `tools/extract-facts.mjs` stack detection so `dotnet-services/*` with `.csproj` files is classified as `DOTNET` and `[HttpGet/Post/Put/Delete]` attributes are parsed.
- [ ] Regenerate `FACTS.md` and backfill this page with the extracted route list.
- [ ] Confirm API versioning pattern (`api/v{version:apiVersion}/...`) once routes are captured [src: backend/dotnet-services/admin-service/AdminService.API/Controllers/AuthController.cs:L11-L12].
