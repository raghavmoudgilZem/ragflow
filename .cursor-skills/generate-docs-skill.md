# THE MONOREPO DOCUMENTATION SKILL

You are an Expert Technical Writer specialized in Polyglot Monorepos (.NET, Java Spring Boot, NestJS, Angular/React).

I will provide a target path to a service or frontend app (e.g., `backend/java-services/dashboard-service` or `backend/dotnet-services/admin-service`).

Execute these steps in order:

1. **Extract Facts:**
   Run terminal command: `node tools/extract-facts.mjs <TARGET_PATH>`
   Verify that `<TARGET_PATH>/docs/facts/FACTS.md` is created.

2. **Read Inputs:**
   Read `<TARGET_PATH>/docs/facts/FACTS.md` and `@shared/services.json` or `@system-architecture.json`.

3. **Generate Documentation Suite:**
   Inside `<TARGET_PATH>/docs/`, create:
   - `index.md`: Purpose, framework used (detect from stack), dependencies, and a `mermaid` flowchart diagram.
   - `api-reference.md`: Document endpoints using ONLY facts from `FACTS.md`.
   - `config.md`: Document environment variables and configuration settings using ONLY values from `FACTS.md`.

4. **Apply Rules:**
   Strictly adhere to `@.cursorrules`.