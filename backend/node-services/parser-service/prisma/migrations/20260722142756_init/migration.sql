-- CreateTable
CREATE TABLE "parse_jobs" (
    "id" UUID NOT NULL,
    "document_id" VARCHAR(255) NOT NULL,
    "document_path" VARCHAR(255) NOT NULL,
    "tenant_id" VARCHAR(255) NOT NULL,
    "status" VARCHAR(50) NOT NULL,
    "attempt_count" INTEGER NOT NULL DEFAULT 0,
    "max_attempts" INTEGER NOT NULL DEFAULT 3,
    "idempotency_key" VARCHAR(255),
    "error_reason" TEXT,
    "parse_data_path" VARCHAR(512),
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "started_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "parse_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "parse_jobs_idempotency_key_key" ON "parse_jobs"("idempotency_key");

-- CreateIndex
CREATE INDEX "idx_document_id" ON "parse_jobs"("document_id");

-- CreateIndex
CREATE INDEX "idx_tenant_status" ON "parse_jobs"("tenant_id", "status");
