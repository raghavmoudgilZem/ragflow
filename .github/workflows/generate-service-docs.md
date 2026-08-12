---
name: Generate Microservice Documentation
on:
  workflow_dispatch:
    inputs:
      service_path:
        description: "Path to the microservice (e.g., backend/node-services/identity-service)"
        required: true
engine: copilot
secrets:
  COPILOT_GITHUB_TOKEN: ${{ secrets.COPILOT_GITHUB_TOKEN }}
safe-outputs:
  create-pull-request: null
---

# Instructions
You are an Expert Technical Writer. Your task is to analyze `${{ github.event.inputs.service_path }}` and generate a multi-page documentation suite inside `${{ github.event.inputs.service_path }}/docs/`.

## Execution Steps
1. **Apply Guardrails:** Ignore files matching `.agentignore`. Read `system-architecture.json` for global context.
2. **Read Facts Pack:** You MUST read `${{ github.event.inputs.service_path }}/docs/facts/FACTS.md` before proceeding.
3. **Generate Core Index:** Create `docs/index.md`. Include a high-level description, dependencies, and a `mermaid` Flowchart architecture map.
4. **Generate Specialized Pages:** Create `docs/api-reference.md` (if APIs exist) and `docs/config.md` (for env vars). Use exact values from `FACTS.md`.
5. **Action:** Open a Pull Request titled "docs: generate documentation for [Service Name]".
