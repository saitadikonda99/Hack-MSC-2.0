/*
  Warnings:

  - Made the column `userId` on table `reports` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `reports` DROP FOREIGN KEY `reports_userId_fkey`;

-- DropIndex
DROP INDEX `reports_userId_fkey` ON `reports`;

-- Create a system user for existing reports without userId
INSERT IGNORE INTO `users` (`id`, `name`, `email`, `password`, `role`, `isActive`, `createdAt`, `updatedAt`) 
VALUES (1, 'System User', 'system@civicindia.com', '$2a$10$dummy.hash.for.system.user', 'admin', true, NOW(), NOW());

-- Update existing reports with NULL userId to use system user
UPDATE `reports` SET `userId` = 1 WHERE `userId` IS NULL;

-- AlterTable
ALTER TABLE `reports` ADD COLUMN `pointsAwarded` INTEGER NOT NULL DEFAULT 0,
    MODIFY `userId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `users` ADD COLUMN `availablePoints` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `totalPoints` INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE `points` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `amount` INTEGER NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `reportId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `reports` ADD CONSTRAINT `reports_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `points` ADD CONSTRAINT `points_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
