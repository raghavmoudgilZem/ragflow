ALTER TABLE `email_templates`
    ADD COLUMN `version` INTEGER NOT NULL DEFAULT 1,
    ADD COLUMN `is_latest` BOOLEAN NOT NULL DEFAULT true;

DROP INDEX `email_templates_template_slug_key` ON `email_templates`;

CREATE UNIQUE INDEX `email_templates_template_slug_version_key` ON `email_templates`(`template_slug`, `version`);
