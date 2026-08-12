# RAGFlow Frontend (React Rewrite)

This project is the React-based rewrite of the RAGFlow frontend. It replaces the legacy Angular application. The repository structure separates global configuration from feature-specific code.

## Project Structure

```text
frontend/
├── angular/                      # Legacy Angular codebase
└── react/                        # New React application
    ├── package.json
    ├── tsconfig.json
    └── src/
        ├── main.tsx              # Application entry point
        ├── app/                  # Bootstrap: router, providers, error boundary
        │   ├── routes.tsx        # React Router routes
        │   └── providers.tsx     # Redux, TanStack Query, MUI Theme, ErrorBoundary
        ├── modules/              # Feature domains (TODO)
        │   ├── identity/
        │   │   ├── pages/        # Feature view components (LoginPage)
        │   │   ├── hooks/        # Feature state hooks and mutations
        │   │   ├── services/     # Business/logic operations
        │   │   ├── api/          # Feature endpoints
        │   │   └── types/        # Feature types and validation schemas
        │   ├── datasets/
        │   ├── chat/
        │   ├── agent/
        │   └── ...
        ├── shared/               # Cross-cutting platform layer
        │   ├── api/
        │   │   ├── client.ts     # Axios instance with interceptors
        │   │   ├── envelope.ts   # API response payload structure
        │   │   └── generated/    # Landing zone for auto-generated OpenAPI types
        │   ├── store/
        │   │   └── store.ts      # Redux Toolkit setup (UI, layouts, light/dark mode)
        │   ├── components/       # Shared UI components (cross-domain only)
        │   ├── hooks/            # Shared utility hooks
        │   ├── layouts/          # Global page layouts
        │   └── i18n.ts           # Baseline internationalization setup
        └── legacy/               # Temporary re-exports and bridge files during migration
```

## Development Rules

### 1. Import Boundaries
* `app/` can import from `modules/` and `shared/`.
* `modules/` can import from `shared/`.
* `shared/` must be feature-agnostic. It cannot import from `modules/` or `app/`.
* Modules cannot cross-import. e.g. Code in `modules/chat` cannot import from `modules/datasets`. Shared code must be moved to `shared/`.

### 2. Path Aliases
Do not use messy relative paths `(../../../../)` to import modules. Use the configured absolute path aliases:

* `@app/*` targets `src/app/*`
* `@modules/*` targets `src/modules/*`
* `@shared/*` targets `src/shared/*`
* `@legacy/*` targets `src/legacy/*`

### 3. More rules to be added

## Commands

### Install Dependencies
```bash
npm install
```

### Run Local Development Server
```bash
npm run dev
```
The application runs locally at http://localhost:5173.

### Build Production Bundle
Runs the TypeScript type check followed by production compilation.

```bash
npm run build
```

### Generate API Types
Generates type-only TypeScript from backend OpenAPI (Swagger) specs into `src/shared/api/generated/`, keeping frontend request/response types in sync with the API contract. No runtime client is generated — the existing `shared/api/client.ts` and envelope handling are reused.

```bash
npm run generate-api
```

With no arguments, the command generates types for every service registered in `scripts/api-services.config.mjs`. Until a backend service exposes a reachable spec, that list is empty and the command is a no-op.

#### Generating from a single spec
When a backend developer provides an OpenAPI URL (or a local spec file), generate that service directly without editing any config:

```bash
npm run generate-api -- <name> <specUrlOrFile>
```

`<name>` becomes the output file `src/shared/api/generated/<name>.ts` and its namespace in the barrel `index.ts`. `<specUrlOrFile>` is either an HTTP(S) URL or a path to a local `openapi.json`.

```bash
npm run generate-api -- dataset http://localhost:3001/api/docs-json
npm run generate-api -- chat ./openapi/chat.json
```

#### Registering a service permanently
Add an entry to `scripts/api-services.config.mjs` so it is generated on every run. Prefer an environment variable for the URL so it is configurable per environment:

```js
export const services = [
  { name: 'chat', spec: process.env.CHAT_API_SPEC ?? 'http://localhost:3000/api/docs-json' },
];
```

#### Notes
* The spec source must be reachable when the command runs; an unreachable or invalid spec fails that service loudly and exits non-zero.
* Generated output is committed and must never be hand-edited — re-run the command after any backend contract change.
* The generated directory is excluded from linting and test coverage.

#### Consuming generated types
Wrap the generated payload type in the existing response envelope at the call site:

```ts
import type { components } from '@shared/api/generated/dataset';
import type { ApiResponse } from '@shared/api/envelope';

type CreateDatasetResponse = ApiResponse<components['schemas']['Dataset']>;
```