-- CreateTable
CREATE TABLE `Pengguna` (
    `id_pengguna` INTEGER NOT NULL AUTO_INCREMENT,
    `nama` VARCHAR(191) NOT NULL,
    `username` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `role` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Pengguna_username_key`(`username`),
    PRIMARY KEY (`id_pengguna`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Meja` (
    `id_meja` INTEGER NOT NULL AUTO_INCREMENT,
    `nomor_meja` VARCHAR(191) NOT NULL,
    `status_meja` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Meja_nomor_meja_key`(`nomor_meja`),
    PRIMARY KEY (`id_meja`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Menu` (
    `id_menu` INTEGER NOT NULL AUTO_INCREMENT,
    `nama_menu` VARCHAR(191) NOT NULL,
    `kategori` VARCHAR(191) NOT NULL,
    `harga` DECIMAL(10, 2) NOT NULL,
    `status_menu` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id_menu`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Transaksi` (
    `id_transaksi` INTEGER NOT NULL AUTO_INCREMENT,
    `tanggal` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `jenis_transaksi` VARCHAR(191) NOT NULL,
    `metode_pembayaran` VARCHAR(191) NOT NULL,
    `total_bayar` DECIMAL(12, 2) NOT NULL,
    `status` VARCHAR(191) NOT NULL,
    `id_pengguna` INTEGER NOT NULL,
    `id_meja` INTEGER NULL,
    `id_closing` INTEGER NULL,

    PRIMARY KEY (`id_transaksi`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DetailTransaksi` (
    `id_detail` INTEGER NOT NULL AUTO_INCREMENT,
    `jumlah` INTEGER NOT NULL,
    `harga` DECIMAL(10, 2) NOT NULL,
    `subtotal` DECIMAL(12, 2) NOT NULL,
    `id_transaksi` INTEGER NOT NULL,
    `id_menu` INTEGER NOT NULL,

    PRIMARY KEY (`id_detail`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Bahan` (
    `id_bahan` INTEGER NOT NULL AUTO_INCREMENT,
    `nama_bahan` VARCHAR(191) NOT NULL,
    `jenis_bahan` VARCHAR(191) NOT NULL,
    `satuan` VARCHAR(191) NOT NULL,
    `stok` INTEGER NOT NULL,

    PRIMARY KEY (`id_bahan`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PenggunaanStok` (
    `id_penggunaan` INTEGER NOT NULL AUTO_INCREMENT,
    `tanggal_penggunaan` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `jumlah_pakai` INTEGER NOT NULL,
    `keterangan` VARCHAR(191) NOT NULL,
    `id_pengguna` INTEGER NOT NULL,
    `id_bahan` INTEGER NOT NULL,

    PRIMARY KEY (`id_penggunaan`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BelanjaBahan` (
    `id_belanja` INTEGER NOT NULL AUTO_INCREMENT,
    `tanggal_belanja` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `jumlah_belanja` INTEGER NOT NULL,
    `harga_satuan` DECIMAL(10, 2) NOT NULL,
    `total_belanja` DECIMAL(12, 2) NOT NULL,
    `id_pengguna` INTEGER NOT NULL,
    `id_bahan` INTEGER NOT NULL,
    `id_closing` INTEGER NULL,

    PRIMARY KEY (`id_belanja`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RekomendasiBelanja` (
    `id_rekomendasi` INTEGER NOT NULL AUTO_INCREMENT,
    `tanggal` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `id_bahan` INTEGER NOT NULL,

    PRIMARY KEY (`id_rekomendasi`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ClosingHarian` (
    `id_closing` INTEGER NOT NULL AUTO_INCREMENT,
    `tanggal_closing` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `jumlah_transaksi` INTEGER NOT NULL,
    `pemasukan` DECIMAL(12, 2) NOT NULL,
    `belanja` DECIMAL(12, 2) NOT NULL,
    `total` DECIMAL(12, 2) NOT NULL,
    `id_pengguna` INTEGER NOT NULL,

    PRIMARY KEY (`id_closing`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Transaksi` ADD CONSTRAINT `Transaksi_id_pengguna_fkey` FOREIGN KEY (`id_pengguna`) REFERENCES `Pengguna`(`id_pengguna`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Transaksi` ADD CONSTRAINT `Transaksi_id_meja_fkey` FOREIGN KEY (`id_meja`) REFERENCES `Meja`(`id_meja`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Transaksi` ADD CONSTRAINT `Transaksi_id_closing_fkey` FOREIGN KEY (`id_closing`) REFERENCES `ClosingHarian`(`id_closing`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DetailTransaksi` ADD CONSTRAINT `DetailTransaksi_id_transaksi_fkey` FOREIGN KEY (`id_transaksi`) REFERENCES `Transaksi`(`id_transaksi`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DetailTransaksi` ADD CONSTRAINT `DetailTransaksi_id_menu_fkey` FOREIGN KEY (`id_menu`) REFERENCES `Menu`(`id_menu`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PenggunaanStok` ADD CONSTRAINT `PenggunaanStok_id_pengguna_fkey` FOREIGN KEY (`id_pengguna`) REFERENCES `Pengguna`(`id_pengguna`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PenggunaanStok` ADD CONSTRAINT `PenggunaanStok_id_bahan_fkey` FOREIGN KEY (`id_bahan`) REFERENCES `Bahan`(`id_bahan`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BelanjaBahan` ADD CONSTRAINT `BelanjaBahan_id_pengguna_fkey` FOREIGN KEY (`id_pengguna`) REFERENCES `Pengguna`(`id_pengguna`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BelanjaBahan` ADD CONSTRAINT `BelanjaBahan_id_bahan_fkey` FOREIGN KEY (`id_bahan`) REFERENCES `Bahan`(`id_bahan`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BelanjaBahan` ADD CONSTRAINT `BelanjaBahan_id_closing_fkey` FOREIGN KEY (`id_closing`) REFERENCES `ClosingHarian`(`id_closing`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RekomendasiBelanja` ADD CONSTRAINT `RekomendasiBelanja_id_bahan_fkey` FOREIGN KEY (`id_bahan`) REFERENCES `Bahan`(`id_bahan`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ClosingHarian` ADD CONSTRAINT `ClosingHarian_id_pengguna_fkey` FOREIGN KEY (`id_pengguna`) REFERENCES `Pengguna`(`id_pengguna`) ON DELETE RESTRICT ON UPDATE CASCADE;
