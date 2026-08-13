# Configuration

Environment variables and configuration keys for the Admin Service are defined exclusively by the ground-truth facts pack. Only keys listed in `FACTS.md` appear on this page.

## Source of truth

`backend/dotnet-services/admin-service/docs/facts/FACTS.md` — **Extracted Environment / Config Keys** section [src: backend/dotnet-services/admin-service/docs/facts/FACTS.md:L10-L11]

## Environment variables

`FACTS.md` reports:

> _No explicit environment variables detected._

Because no configuration keys are present in `FACTS.md`, **no environment variables are documented on this page**.

## Configuration checklist

Use this checklist after `FACTS.md` is regenerated. Key names must match the facts pack exactly — do not add names from source code until they appear in `FACTS.md`.

- [ ] _(pending facts extraction)_

## ⚠️ To Verify

- [ ] Re-run fact extraction after fixing stack detection; the current `FACTS.md` was generated with `JAVA_SPRING_BOOT` logic and captured zero config keys [src: backend/dotnet-services/admin-service/docs/facts/FACTS.md:L4-L11].
- [ ] Docker runtime sets `ASPNETCORE_URLS` and `ASPNETCORE_ENVIRONMENT`, which are not present in `FACTS.md` [src: backend/dotnet-services/admin-service/Dockerfile:L30-L31].
- [ ] `appsettings.json` contains `Jwt` settings (`Issuer`, `Audience`, `Secret`, `AccessTokenMinutes`, `RefreshTokenDays`) and an empty `Services` section, none of which appear in `FACTS.md` [src: backend/dotnet-services/admin-service/AdminService.API/appsettings.json:L9-L18].
- [ ] Service URLs are loaded from `config/services.json` via `Configuration["Services:IdentityService"]` — confirm whether these belong in the facts pack [src: backend/dotnet-services/admin-service/AdminService.API/Program.cs:L105] [src: backend/dotnet-services/admin-service/AdminService.Infrastructure/DependencyInjection.cs:L19].
- [ ] Shared registry at `backend/shared/services.json` lists downstream service URLs but these are not in `FACTS.md` [src: backend/shared/services.json:L2-L8].
