-- CreateTable
CREATE TABLE `KomposisiMenu` (
    `id_komposisi` INTEGER NOT NULL AUTO_INCREMENT,
    `jumlah_butuh` DOUBLE NOT NULL,
    `id_menu` INTEGER NOT NULL,
    `id_bahan` INTEGER NOT NULL,

    PRIMARY KEY (`id_komposisi`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `KomposisiMenu` ADD CONSTRAINT `KomposisiMenu_id_menu_fkey` FOREIGN KEY (`id_menu`) REFERENCES `Menu`(`id_menu`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `KomposisiMenu` ADD CONSTRAINT `KomposisiMenu_id_bahan_fkey` FOREIGN KEY (`id_bahan`) REFERENCES `Bahan`(`id_bahan`) ON DELETE RESTRICT ON UPDATE CASCADE;
