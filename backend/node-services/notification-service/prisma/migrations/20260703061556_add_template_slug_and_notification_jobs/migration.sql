/*
  Warnings:

  - A unique constraint covering the columns `[template_slug]` on the table `email_templates` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `template_slug` to the `email_templates` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `email_templates` ADD COLUMN `template_slug` VARCHAR(100) NOT NULL;

-- CreateTable
CREATE TABLE `notification_jobs` (
    `job_id` BIGINT NOT NULL AUTO_INCREMENT,
    `bull_job_id` VARCHAR(100) NULL,
    `recipient` VARCHAR(255) NOT NULL,
    `channel` ENUM('EMAIL', 'SMS') NOT NULL,
    `template_slug` VARCHAR(100) NOT NULL,
    `template_id` BIGINT NULL,
    `data` TEXT NOT NULL,
    `status` ENUM('queued', 'processing', 'sent', 'failed') NOT NULL DEFAULT 'queued',
    `error_message` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `processed_at` DATETIME(3) NULL,
    `updated_at` DATETIME(3) NULL,

    PRIMARY KEY (`job_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `email_templates_template_slug_key` ON `email_templates`(`template_slug`);

-- AddForeignKey
ALTER TABLE `notification_jobs` ADD CONSTRAINT `notification_jobs_template_id_fkey` FOREIGN KEY (`template_id`) REFERENCES `email_templates`(`template_id`) ON DELETE SET NULL ON UPDATE CASCADE;
