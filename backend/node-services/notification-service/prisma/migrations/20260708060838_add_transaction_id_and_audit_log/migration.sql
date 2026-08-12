/*
  Warnings:

  - A unique constraint covering the columns `[transaction_id]` on the table `notification_jobs` will be added. If there are existing duplicate values, this will fail.
  - The required column `transaction_id` was added to the `notification_jobs` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- AlterTable
ALTER TABLE `notification_jobs` ADD COLUMN `correlation_id` VARCHAR(100) NULL,
    ADD COLUMN `source_service` VARCHAR(100) NULL,
    ADD COLUMN `transaction_id` VARCHAR(36) NOT NULL;

-- CreateTable
CREATE TABLE `notification_audit_log` (
    `audit_id` BIGINT NOT NULL AUTO_INCREMENT,
    `transaction_id` VARCHAR(36) NOT NULL,
    `event` ENUM('created', 'processing', 'sent', 'failed', 'retrying') NOT NULL,
    `detail` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`audit_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `notification_jobs_transaction_id_key` ON `notification_jobs`(`transaction_id`);

-- AddForeignKey
ALTER TABLE `notification_audit_log` ADD CONSTRAINT `notification_audit_log_transaction_id_fkey` FOREIGN KEY (`transaction_id`) REFERENCES `notification_jobs`(`transaction_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
