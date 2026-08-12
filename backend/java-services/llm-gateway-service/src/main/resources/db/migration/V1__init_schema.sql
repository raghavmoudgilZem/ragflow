-- Baseline schema for llm-gateway-service.
--
-- Three tables: two seed/reference tables reconciled from a bundled catalog resource at startup
-- (llm_factory, llm_catalog_model), and one table with live per-tenant write traffic
-- (tenant_llm_config). See LLM_GATEWAY_SERVICE_LLD.md §8 for the full schema design and the
-- relationships between them (enforced at the service layer, not via DB-level foreign keys).

CREATE TABLE llm_factory (
    name              VARCHAR(128)  NOT NULL,
    display_name      VARCHAR(128)  NULL,
    logo_url          VARCHAR(512)  NULL,
    tags              VARCHAR(255)  NOT NULL,
    credential_schema JSON          NOT NULL,
    `rank`            INT           NOT NULL,
    launch_supported  BOOLEAN       NOT NULL,
    active            BOOLEAN       NOT NULL,
    PRIMARY KEY (name)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE llm_catalog_model (
    factory_name    VARCHAR(128)  NOT NULL,
    model_name      VARCHAR(128)  NOT NULL,
    model_type      VARCHAR(32)   NOT NULL,
    max_tokens      INT           NOT NULL,
    supports_tools  BOOLEAN       NOT NULL,
    tags            VARCHAR(255)  NULL,
    active          BOOLEAN       NOT NULL,
    PRIMARY KEY (factory_name, model_name)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE tenant_llm_config (
    id           BIGINT        NOT NULL AUTO_INCREMENT,
    tenant_id    VARCHAR(64)   NOT NULL,
    llm_factory  VARCHAR(128)  NOT NULL,
    llm_name     VARCHAR(128)  NOT NULL,
    model_type   VARCHAR(32)   NOT NULL,
    credentials  JSON          NOT NULL,
    max_tokens   INT           NOT NULL,
    used_tokens  BIGINT        NOT NULL DEFAULT 0,
    enabled      BOOLEAN       NOT NULL DEFAULT TRUE,
    created_at   DATETIME(6)   NOT NULL,
    updated_at   DATETIME(6)   NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT uq_tenant_factory_model UNIQUE (tenant_id, llm_factory, llm_name)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE INDEX idx_tenant_id ON tenant_llm_config (tenant_id);
CREATE INDEX idx_model_type ON tenant_llm_config (model_type);
