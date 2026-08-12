# Documentation Generation Rules (Playbook Enforcer)

## Ground Truth
- `docs/facts/FACTS.md` inside the service folder is authoritative. If it conflicts with your reading of the code, `FACTS.md` wins and you flag the conflict under "⚠️ To Verify".
- Never state an environment variable name, route path, queue topic name, error code, or port number that does not appear verbatim in `FACTS.md`.

## Source Anchors
- Every non-obvious technical claim must end with `[src: path/to/file:L12-L30]`.
- Section headings and general connective prose are exempt.
- Line ranges must be real. If unsure of the exact line numbers, cite the file path only.

## Uncertainty Protocol
Every generated file MUST end with this section:
## ⚠️ To Verify
- [ ] [Inferred claim] — inferred from [file/context], could not confirm [reason]

If you inferred anything or had to guess, list it here. Do not use hedged prose ("typically", "generally", "should"). Either cite a hard fact with an anchor, or list it under "To Verify".

## Diagrams & Formatting
- Mermaid diagrams only (`flowchart TD`, `sequenceDiagram`, `erDiagram`).
- Tables over prose for anything enumerable (APIs, env vars, database models).
- No marketing jargon ("robust", "seamless", "efficient"). Describe what the code actually does.