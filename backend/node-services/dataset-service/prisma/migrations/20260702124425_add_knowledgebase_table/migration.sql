/*
  Warnings:

  - You are about to drop the `placeholder` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE `placeholder`;

-- CreateTable
CREATE TABLE `knowledgebase` (
    `id` VARCHAR(191) NOT NULL,
    `tenant_id` VARCHAR(32) NOT NULL,
    `name` VARCHAR(128) NOT NULL,
    `embd_id` VARCHAR(128) NOT NULL,
    `tenant_embd_id` VARCHAR(128) NOT NULL,
    `created_by` VARCHAR(32) NOT NULL,
    `pipeline_id` VARCHAR(32) NULL,
    `status` CHAR(1) NOT NULL DEFAULT '1',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
