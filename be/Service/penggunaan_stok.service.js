const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createPenggunaan = async (data) => {
    // Jalankan dalam transaksi agar jika gagal salah satu, semua dibatalkan
    return await prisma.$transaction(async (tx) => {
        
        // 1. Cek ketersediaan stok bahan saat ini
        const bahan = await tx.bahan.findUnique({
            where: { id_bahan: Number(data.id_bahan) }
        });

        if (!bahan) throw new Error('Bahan baku tidak ditemukan!');
        if (bahan.stok < Number(data.jumlah_pakai)) {
            throw new Error(`Stok ${bahan.nama_bahan} tidak mencukupi! Sisa stok: ${bahan.stok}`);
        }

        // 2. Buat riwayat penggunaan stok
        const penggunaanBaru = await tx.penggunaanStok.create({
            data: {
                id_user: Number(data.id_user),
                id_bahan: Number(data.id_bahan),
                jumlah_pakai: Number(data.jumlah_pakai),
                keterangan: data.keterangan,
                tanggal_penggunaan: data.tanggal_penggunaan ? new Date(data.tanggal_penggunaan) : new Date()
            },
            include: {
                bahan: true,
                user: { select: { nama: true } }
            }
        });

        // 3. Kurangi stok secara otomatis pada Master Data Bahan
        await tx.bahan.update({
            where: { id_bahan: Number(data.id_bahan) },
            data: {
                stok: {
                    decrement: Number(data.jumlah_pakai) // Fitur Prisma untuk mengurangi angka secara otomatis
                }
            }
        });

        return penggunaanBaru;
    });
};

const getAllPenggunaan = async (tanggal) => {
    let whereClause = {};

    if (tanggal) {
        const startOfDay = new Date(tanggal);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(tanggal);
        endOfDay.setHours(23, 59, 59, 999);

        whereClause = {
            tanggal_penggunaan: {
                gte: startOfDay,
                lte: endOfDay
            }
        };
    }
    return await prisma.penggunaanStok.findMany({
        where: whereClause,
        include: {
            bahan: true,
            user: { select: { nama: true } }
        },
        orderBy: {
            tanggal_penggunaan: 'desc'
        }
    });
};

module.exports = {
    createPenggunaan,
    getAllPenggunaan
};