-- AlterTable
ALTER TABLE `knowledgebase` MODIFY `created_by` VARCHAR(36) NOT NULL,
    MODIFY `pipeline_id` VARCHAR(36) NULL;
