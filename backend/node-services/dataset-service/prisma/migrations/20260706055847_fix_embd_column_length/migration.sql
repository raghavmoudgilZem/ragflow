/*
  Warnings:

  - You are about to alter the column `embd_id` on the `knowledgebase` table. The data in that column could be lost. The data in that column will be cast from `VarChar(128)` to `VarChar(36)`.
  - You are about to alter the column `tenant_embd_id` on the `knowledgebase` table. The data in that column could be lost. The data in that column will be cast from `VarChar(128)` to `VarChar(36)`.

*/
-- AlterTable
ALTER TABLE `knowledgebase` MODIFY `embd_id` VARCHAR(36) NOT NULL,
    MODIFY `tenant_embd_id` VARCHAR(36) NOT NULL;
