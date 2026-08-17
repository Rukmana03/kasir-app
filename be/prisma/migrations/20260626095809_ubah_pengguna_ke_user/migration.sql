/*
  Warnings:

  - You are about to drop the column `id_pengguna` on the `BelanjaBahan` table. All the data in the column will be lost.
  - You are about to drop the column `id_pengguna` on the `ClosingHarian` table. All the data in the column will be lost.
  - You are about to drop the column `id_pengguna` on the `PenggunaanStok` table. All the data in the column will be lost.
  - You are about to drop the column `id_pengguna` on the `Transaksi` table. All the data in the column will be lost.
  - You are about to drop the `Pengguna` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `id_user` to the `BelanjaBahan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id_user` to the `ClosingHarian` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id_user` to the `PenggunaanStok` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id_user` to the `Transaksi` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `BelanjaBahan` DROP FOREIGN KEY `BelanjaBahan_id_pengguna_fkey`;

-- DropForeignKey
ALTER TABLE `ClosingHarian` DROP FOREIGN KEY `ClosingHarian_id_pengguna_fkey`;

-- DropForeignKey
ALTER TABLE `PenggunaanStok` DROP FOREIGN KEY `PenggunaanStok_id_pengguna_fkey`;

-- DropForeignKey
ALTER TABLE `Transaksi` DROP FOREIGN KEY `Transaksi_id_pengguna_fkey`;

-- DropIndex
DROP INDEX `BelanjaBahan_id_pengguna_fkey` ON `BelanjaBahan`;

-- DropIndex
DROP INDEX `ClosingHarian_id_pengguna_fkey` ON `ClosingHarian`;

-- DropIndex
DROP INDEX `PenggunaanStok_id_pengguna_fkey` ON `PenggunaanStok`;

-- DropIndex
DROP INDEX `Transaksi_id_pengguna_fkey` ON `Transaksi`;

-- AlterTable
ALTER TABLE `BelanjaBahan` DROP COLUMN `id_pengguna`,
    ADD COLUMN `id_user` INTEGER NOT NULL,
    MODIFY `tanggal_belanja` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `ClosingHarian` DROP COLUMN `id_pengguna`,
    ADD COLUMN `id_user` INTEGER NOT NULL,
    MODIFY `tanggal_closing` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `PenggunaanStok` DROP COLUMN `id_pengguna`,
    ADD COLUMN `id_user` INTEGER NOT NULL,
    MODIFY `tanggal_penggunaan` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `RekomendasiBelanja` MODIFY `tanggal` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `Transaksi` DROP COLUMN `id_pengguna`,
    ADD COLUMN `id_user` INTEGER NOT NULL;

-- DropTable
DROP TABLE `Pengguna`;

-- CreateTable
CREATE TABLE `User` (
    `id_user` INTEGER NOT NULL AUTO_INCREMENT,
    `nama` VARCHAR(191) NOT NULL,
    `username` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `role` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `User_username_key`(`username`),
    PRIMARY KEY (`id_user`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Transaksi` ADD CONSTRAINT `Transaksi_id_user_fkey` FOREIGN KEY (`id_user`) REFERENCES `User`(`id_user`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PenggunaanStok` ADD CONSTRAINT `PenggunaanStok_id_user_fkey` FOREIGN KEY (`id_user`) REFERENCES `User`(`id_user`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BelanjaBahan` ADD CONSTRAINT `BelanjaBahan_id_user_fkey` FOREIGN KEY (`id_user`) REFERENCES `User`(`id_user`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ClosingHarian` ADD CONSTRAINT `ClosingHarian_id_user_fkey` FOREIGN KEY (`id_user`) REFERENCES `User`(`id_user`) ON DELETE RESTRICT ON UPDATE CASCADE;
