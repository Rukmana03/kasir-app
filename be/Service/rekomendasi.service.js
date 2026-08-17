const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getProyeksiKebutuhan = async (hariTarget) => {
    const target = new Date(hariTarget);
    
    const historicalDates = [1, 2, 3].map(weeks => {
        const d = new Date(target);
        d.setDate(d.getDate() - (weeks * 7));
        return d;
    });

    let totalKebutuhan = {}; 
    let validDaysCount = 0; 

    for (const date of historicalDates) {
        // FORCE UTC: Bypass local WIB timezone offset
        const dateStr = date.toISOString().split('T')[0];
        const awal = new Date(`${dateStr}T00:00:00.000Z`);
        const akhir = new Date(`${dateStr}T23:59:59.999Z`);

        const transaksi = await prisma.detailTransaksi.findMany({
            where: {
                transaksi: {
                    tanggal: { gte: awal, lte: akhir }
                }
            },
            include: { menu: { include: { komposisi: true } } }
        });

        if (transaksi.length > 0) {
            validDaysCount++;
            transaksi.forEach(dt => {
                const jumlahTerjual = dt.jumlah; 
                dt.menu.komposisi.forEach(resep => {
                    const idBahan = resep.id_bahan;
                    const jumlahButuh = resep.jumlah_butuh * jumlahTerjual; 
                    totalKebutuhan[idBahan] = (totalKebutuhan[idBahan] || 0) + jumlahButuh;
                });
            });
        }
    }

    let proyeksiKebutuhan = {}; 

    if (validDaysCount > 0) {
        for (const idBahan in totalKebutuhan) {
            const rataRata = totalKebutuhan[idBahan] / validDaysCount;
            const safetyStock = rataRata * 0.15; 
            proyeksiKebutuhan[idBahan] = Math.ceil(rataRata + safetyStock);
        }
    }
    
    return proyeksiKebutuhan;
};

const generateRekomendasi = async (targetDateString) => {
    const hariTarget = targetDateString ? new Date(targetDateString) : new Date();
    const proyeksiKebutuhan = await getProyeksiKebutuhan(hariTarget);

    const semuaBahan = await prisma.bahan.findMany();
    let rekomendasiBaru = [];

    for (const bahan of semuaBahan) {
        const id = bahan.id_bahan;
        const stokAktual = bahan.stok;
        const kebutuhanTargetHari = proyeksiKebutuhan[id] || 0; 
        
        if (kebutuhanTargetHari > 0 && stokAktual < kebutuhanTargetHari) {
            rekomendasiBaru.push({
                id_bahan: bahan.id_bahan,
                tanggal: hariTarget 
            });
        }
    }

    return await prisma.$transaction(async (tx) => {
        const dateStr = hariTarget.toISOString().split('T')[0];
        const awalHariTarget = new Date(`${dateStr}T00:00:00.000Z`);
        const akhirHariTarget = new Date(`${dateStr}T23:59:59.999Z`);

        await tx.rekomendasiBelanja.deleteMany({
            where: { 
                tanggal: { gte: awalHariTarget, lte: akhirHariTarget } 
            }
        });

        if (rekomendasiBaru.length > 0) {
            await tx.rekomendasiBelanja.createMany({
                data: rekomendasiBaru
            });
        }

        const dataRekomendasi = await tx.rekomendasiBelanja.findMany({
            where: { 
                tanggal: { gte: awalHariTarget, lte: akhirHariTarget } 
            },
            include: { bahan: true }
        });
        
        return dataRekomendasi.map(r => {
            const kebutuhan = proyeksiKebutuhan[r.id_bahan] || 0;
            const kurang = Math.max(0, kebutuhan - (r.bahan?.stok || 0));
            return {
                ...r,
                kebutuhan,
                kurang
            };
        });
    });
};

const getDrafRekomendasi = async (targetDateString) => {
    const hariTarget = targetDateString ? new Date(targetDateString) : new Date();
    
    const dateStr = hariTarget.toISOString().split('T')[0];
    const awalHariTarget = new Date(`${dateStr}T00:00:00.000Z`);
    const akhirHariTarget = new Date(`${dateStr}T23:59:59.999Z`);

    const dataRekomendasi = await prisma.rekomendasiBelanja.findMany({
        where: { 
            tanggal: { gte: awalHariTarget, lte: akhirHariTarget } 
        },
        include: { 
            bahan: {
                select: { id_bahan: true, nama_bahan: true, jenis_bahan: true, stok: true, satuan: true }
            } 
        }
    });
    
    const proyeksiKebutuhan = await getProyeksiKebutuhan(hariTarget);
    
    return dataRekomendasi.map(r => {
        const kebutuhan = proyeksiKebutuhan[r.id_bahan] || 0;
        const kurang = Math.max(0, kebutuhan - (r.bahan?.stok || 0));
        return {
            ...r,
            kebutuhan,
            kurang
        };
    });
};

const hitungKalkulatorManual = async (targetMenu) => {
    let totalKebutuhanBahan = {};

    // 1. Hitung total kebutuhan bahan (Sama seperti sebelumnya)
    for (const item of targetMenu) {
        const menu = await prisma.menu.findUnique({
            where: { id_menu: Number(item.id_menu) },
            include: { komposisi: true }
        });

        if (menu && menu.komposisi) {
            menu.komposisi.forEach(resep => {
                const idBahan = resep.id_bahan;
                const jumlahButuh = resep.jumlah_butuh * Number(item.porsi);
                totalKebutuhanBahan[idBahan] = (totalKebutuhanBahan[idBahan] || 0) + jumlahButuh;
            });
        }
    }

    let hasilKalkulasi = [];
    
    // 2. Kalkulasi Stok & Cari Harga Beli Terakhir
    for (const idBahan in totalKebutuhanBahan) {
        const bahan = await prisma.bahan.findUnique({
            where: { id_bahan: Number(idBahan) }
        });

        if (bahan) {
            const kebutuhan = totalKebutuhanBahan[idBahan];
            const stokAktual = bahan.stok || 0;
            const kurang = Math.max(0, kebutuhan - stokAktual);

            // LOGIKA BARU: Cari harga satuan dari transaksi belanja TERAKHIR bahan ini
            // (Asumsi nama model Anda di Prisma adalah belanjaBahan atau logBelanja)
            const belanjaTerakhir = await prisma.belanjaBahan.findFirst({
                where: { id_bahan: Number(idBahan) },
                orderBy: { tanggal_belanja: 'desc' } // Ambil yang paling baru
            });

            // Jika ada riwayat, pakai harganya. Jika belum pernah belanja, default ke 0.
            const hargaSatuan = belanjaTerakhir ? belanjaTerakhir.harga_satuan : 0;
            const estimasiBiaya = kurang * hargaSatuan;

            hasilKalkulasi.push({
                id_bahan: bahan.id_bahan,
                nama_bahan: bahan.nama_bahan,
                satuan: bahan.satuan,
                kebutuhan_total: kebutuhan,
                sisa_stok: stokAktual,
                harus_beli: kurang,
                estimasi_harga_satuan: hargaSatuan, // Data baru
                estimasi_biaya_total: estimasiBiaya // Data baru
            });
        }
    }

    return hasilKalkulasi;
};

module.exports = {
    generateRekomendasi,
    getDrafRekomendasi,
    hitungKalkulatorManual
};