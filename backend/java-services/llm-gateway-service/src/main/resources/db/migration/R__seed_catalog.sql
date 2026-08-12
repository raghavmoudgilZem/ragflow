-- Repeatable migration: reconciles llm_factory / llm_catalog_model reference data.
--
-- Content mirrors src/main/resources/llm_factories.json — keep the two in sync when editing.
-- (The JSON file itself is no longer read at runtime; this migration is now the source of truth.
-- It stays alongside the JSON for now purely as a human-readable reference of the same data.)
--
-- Being a REPEATABLE migration (R__ prefix, not V__), Flyway re-runs this automatically whenever
-- its content changes (tracked by checksum) — no new version file needed per catalog edit, just
-- edit this file and redeploy. Still goes through Flyway's migration lock, so concurrent app
-- instances starting at once can't race each other seeding the same rows (unlike the previous
-- startup-time ApplicationRunner approach, which had no such lock).
--
-- Upsert only — never deletes. Removing a factory/model from this file leaves the existing row
-- in place rather than dropping it, so no tenant_llm_config row is ever left referencing a
-- catalog entry that vanished out from under it.

INSERT INTO llm_factory
    (name, display_name, logo_url, tags, credential_schema, `rank`, launch_supported, active)
VALUES
    ('OpenAI', 'OpenAI', 'https://cdn.internal/llm-logos/openai.svg', 'LLM,TEXT EMBEDDING',
     JSON_ARRAY(
        JSON_OBJECT('key', 'apiKey', 'label', 'API Key', 'secret', TRUE, 'required', TRUE),
        JSON_OBJECT('key', 'apiBase', 'label', 'API Base URL', 'secret', FALSE, 'required', FALSE)
     ), 100, TRUE, TRUE),

    ('Azure-OpenAI', 'Azure OpenAI', 'https://cdn.internal/llm-logos/azure-openai.svg', 'LLM,TEXT EMBEDDING',
     JSON_ARRAY(
        JSON_OBJECT('key', 'apiKey', 'label', 'API Key', 'secret', TRUE, 'required', TRUE),
        JSON_OBJECT('key', 'apiBase', 'label', 'Endpoint URL', 'secret', FALSE, 'required', TRUE),
        JSON_OBJECT('key', 'apiVersion', 'label', 'API Version', 'secret', FALSE, 'required', TRUE)
     ), 90, TRUE, TRUE),

    ('Anthropic', 'Anthropic', 'https://cdn.internal/llm-logos/anthropic.svg', 'LLM',
     JSON_ARRAY(
        JSON_OBJECT('key', 'apiKey', 'label', 'API Key', 'secret', TRUE, 'required', TRUE)
     ), 95, TRUE, TRUE),

    ('Ollama', 'Ollama (self-hosted)', 'https://cdn.internal/llm-logos/ollama.svg', 'LLM,TEXT EMBEDDING',
     JSON_ARRAY(
        JSON_OBJECT('key', 'apiBase', 'label', 'Ollama Base URL', 'secret', FALSE, 'required', TRUE)
     ), 50, TRUE, TRUE),

    ('Bedrock', 'AWS Bedrock', 'https://cdn.internal/llm-logos/bedrock.svg', 'LLM',
     JSON_ARRAY(
        JSON_OBJECT('key', 'authMode', 'label', 'Auth Mode', 'secret', FALSE, 'required', TRUE),
        JSON_OBJECT('key', 'bedrockAccessKey', 'label', 'Access Key', 'secret', TRUE, 'required', TRUE),
        JSON_OBJECT('key', 'bedrockSecretKey', 'label', 'Secret Key', 'secret', TRUE, 'required', TRUE),
        JSON_OBJECT('key', 'bedrockRegion', 'label', 'Region', 'secret', FALSE, 'required', TRUE)
     ), 40, FALSE, TRUE)

ON DUPLICATE KEY UPDATE
    display_name     = VALUES(display_name),
    logo_url          = VALUES(logo_url),
    tags              = VALUES(tags),
    credential_schema = VALUES(credential_schema),
    `rank`            = VALUES(`rank`),
    launch_supported  = VALUES(launch_supported),
    active            = VALUES(active);

INSERT INTO llm_catalog_model
    (factory_name, model_name, model_type, max_tokens, supports_tools, tags, active)
VALUES
    ('OpenAI', 'gpt-5.2',          'CHAT',      400000, TRUE,  'LLM',            TRUE),
    ('OpenAI', 'gpt-5.2-mini',     'CHAT',      400000, TRUE,  'LLM',            TRUE),
    ('OpenAI', 'text-embedding-4', 'EMBEDDING', 8192,   FALSE, 'TEXT EMBEDDING', TRUE),

    ('Azure-OpenAI', 'gpt-5.2',          'CHAT',      400000, TRUE,  'LLM',            TRUE),
    ('Azure-OpenAI', 'text-embedding-4', 'EMBEDDING', 8192,   FALSE, 'TEXT EMBEDDING', TRUE),

    ('Anthropic', 'claude-opus-4-8',   'CHAT', 200000, TRUE, 'LLM', TRUE),
    ('Anthropic', 'claude-sonnet-4-8', 'CHAT', 200000, TRUE, 'LLM', TRUE),

    ('Bedrock', 'anthropic.claude-3-sonnet', 'CHAT', 200000, TRUE, 'LLM', TRUE)

ON DUPLICATE KEY UPDATE
    model_type     = VALUES(model_type),
    max_tokens     = VALUES(max_tokens),
    supports_tools = VALUES(supports_tools),
    tags           = VALUES(tags),
    active         = VALUES(active);

-- Ollama is intentionally seeded with zero catalog models — it's self-hosted, so there's no fixed
-- set of models to enumerate (a tenant names whatever they've pulled locally). See
-- LLM_GATEWAY_SERVICE_LLD.md §6.3 / §8.2 for why self-hosted factories skip the catalog-membership
-- check entirely rather than having placeholder rows here.
