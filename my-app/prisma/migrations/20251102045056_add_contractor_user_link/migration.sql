-- AlterTable
ALTER TABLE `contractors` ADD COLUMN `userId` INTEGER NULL,
    ADD UNIQUE INDEX `contractors_userId_key`(`userId`);

-- CreateIndex
CREATE INDEX `contractors_userId_fkey` ON `contractors`(`userId`);

-- AddForeignKey
ALTER TABLE `contractors` ADD CONSTRAINT `contractors_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
