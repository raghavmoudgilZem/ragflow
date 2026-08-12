-- CreateEnum
CREATE TYPE "NodeType" AS ENUM ('FILE', 'FOLDER');

-- CreateEnum
CREATE TYPE "StorageProvider" AS ENUM ('LOCAL', 'MINIO', 'S3');

-- CreateTable
CREATE TABLE "file_nodes" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "created_by" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "node_type" "NodeType" NOT NULL,
    "parent_id" UUID,
    "mime_type" VARCHAR(255),
    "extension" VARCHAR(50),
    "size_bytes" BIGINT,
    "storage_provider" "StorageProvider",
    "storage_bucket" VARCHAR(255),
    "storage_key" VARCHAR(1024),
    "source_type" VARCHAR(50),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "file_nodes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "file_nodes_tenant_id_parent_id_idx" ON "file_nodes"("tenant_id", "parent_id");

-- CreateIndex
CREATE INDEX "file_nodes_tenant_id_parent_id_name_idx" ON "file_nodes"("tenant_id", "parent_id", "name");

-- CreateIndex
CREATE INDEX "file_nodes_tenant_id_node_type_idx" ON "file_nodes"("tenant_id", "node_type");

-- CreateIndex
CREATE INDEX "file_nodes_parent_id_idx" ON "file_nodes"("parent_id");

-- AddForeignKey
ALTER TABLE "file_nodes" ADD CONSTRAINT "file_nodes_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "file_nodes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreatePartialUniqueIndex
CREATE UNIQUE INDEX "uq_file_nodes_child_name"
ON "file_nodes" ("tenant_id", "parent_id", "name")
WHERE "parent_id" IS NOT NULL;

-- CreatePartialUniqueIndex
CREATE UNIQUE INDEX "uq_file_nodes_root_name"
ON "file_nodes" ("tenant_id", "name")
WHERE "parent_id" IS NULL;