-- CreateTable
CREATE TABLE `SearchConfiguration` (
    `id` VARCHAR(191) NOT NULL,
    `name` TEXT NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `tenantId` VARCHAR(255) NOT NULL,
    `config` JSON NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `SearchConfiguration_userId_idx`(`userId`),
    INDEX `SearchConfiguration_tenantId_idx`(`tenantId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SearchLog` (
    `id` VARCHAR(191) NOT NULL,
    `configId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `tenantId` VARCHAR(255) NOT NULL,
    `query` TEXT NOT NULL,
    `response` TEXT NOT NULL,
    `chunkIds` JSON NOT NULL,
    `executionTime` DOUBLE NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `SearchLog_userId_idx`(`userId`),
    INDEX `SearchLog_configId_idx`(`configId`),
    INDEX `SearchLog_tenantId_idx`(`tenantId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `SearchLog` ADD CONSTRAINT `SearchLog_configId_fkey` FOREIGN KEY (`configId`) REFERENCES `SearchConfiguration`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
