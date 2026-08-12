-- CreateTable
CREATE TABLE `notification_service_config` (
    `config_id` BIGINT NOT NULL AUTO_INCREMENT,
    `channel_type` ENUM('EMAIL', 'SMS') NOT NULL,
    `provider_name` VARCHAR(50) NOT NULL,
    `provider_host` VARCHAR(255) NULL,
    `provider_port` INTEGER NULL,
    `client_id` VARCHAR(255) NULL,
    `client_secret_key` VARCHAR(255) NULL,
    `status` BOOLEAN NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,

    PRIMARY KEY (`config_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `email_templates` (
    `template_id` BIGINT NOT NULL AUTO_INCREMENT,
    `template_name` VARCHAR(100) NOT NULL,
    `subject` VARCHAR(255) NULL,
    `template` TEXT NOT NULL,
    `status` BOOLEAN NOT NULL,
    `created_at` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`template_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notification_logs` (
    `email_log_id` BIGINT NOT NULL AUTO_INCREMENT,
    `recipient` VARCHAR(255) NOT NULL,
    `template_id` BIGINT NOT NULL,
    `config_id` BIGINT NOT NULL,
    `data` TEXT NOT NULL,
    `status` ENUM('sent', 'failed') NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `sent_at` DATETIME(3) NULL,
    `updated_at` DATETIME(3) NULL,

    PRIMARY KEY (`email_log_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `notification_logs` ADD CONSTRAINT `notification_logs_template_id_fkey` FOREIGN KEY (`template_id`) REFERENCES `email_templates`(`template_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notification_logs` ADD CONSTRAINT `notification_logs_config_id_fkey` FOREIGN KEY (`config_id`) REFERENCES `notification_service_config`(`config_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
