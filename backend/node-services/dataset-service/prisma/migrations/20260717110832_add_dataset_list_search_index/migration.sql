-- CreateIndex
CREATE INDEX `knowledgebase_created_by_status_name_idx` ON `knowledgebase`(`created_by`, `status`, `name`);
