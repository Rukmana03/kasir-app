const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createBelanja = async (data) => {
    const jumlahBelanja = Number(data.jumlah_belanja);
    const hargaSatuan = parseFloat(data.harga_satuan);
    const totalBelanja = jumlahBelanja * hargaSatuan; // Kalkulasi otomatis total pengeluaran

    // Jalankan dalam transaksi
    return await prisma.$transaction(async (tx) => {
        
        // 1. Validasi apakah bahan yang dibeli ada di master data
        const bahan = await tx.bahan.findUnique({
            where: { id_bahan: Number(data.id_bahan) }
        });

        if (!bahan) throw new Error('Bahan baku tidak ditemukan di sistem!');

        // 2. Buat riwayat belanja bahan (Cash-out)
        const belanjaBaru = await tx.belanjaBahan.create({
            data: {
                id_user: Number(data.id_user),
                id_bahan: Number(data.id_bahan),
                jumlah_belanja: jumlahBelanja,
                harga_satuan: hargaSatuan,
                total_belanja: totalBelanja,
                tanggal_belanja: data.tanggal_belanja ? new Date(data.tanggal_belanja) : new Date()
                // id_closing dibiarkan null dulu, nanti akan diisi saat proses closing harian
            },
            include: {
                bahan: true,
                user: { select: { nama: true } }
            }
        });

        // 3. Tambah stok bahan secara otomatis (Restock)
        await tx.bahan.update({
            where: { id_bahan: Number(data.id_bahan) },
            data: {
                stok: {
                    increment: jumlahBelanja // Fitur Prisma untuk menambah angka otomatis
                }
            }
        });

        return belanjaBaru;
    });
};

const getAllBelanja = async (tanggal) => {
    let whereClause = {};

    if (tanggal) {
        const startOfDay = new Date(tanggal);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(tanggal);
        endOfDay.setHours(23, 59, 59, 999);

        whereClause = {
            tanggal_belanja: {
                gte: startOfDay,
                lte: endOfDay
            }
        };
    }
    return await prisma.belanjaBahan.findMany({
        where: whereClause,
        include: {
            bahan: true,
            user: { select: { nama: true } }
        },
        orderBy: {
            tanggal_belanja: 'desc'
        }
    });
};

module.exports = {
    createBelanja,
    getAllBelanja
};