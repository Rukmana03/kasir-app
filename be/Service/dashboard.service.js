const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const rekomendasiService = require('./rekomendasi.service');

const getRingkasanDashboard = async (period = 'daily') => {
    const now = new Date();
    let startDate = new Date();
    let endDate = new Date();
    const buckets = []; // Penampung titik-titik grafik

    // 1. TENTUKAN RENTANG WAKTU BERDASARKAN FILTER
    if (period === 'yearly') {
        // 5 Tahun Terakhir
        const year = now.getFullYear();
        startDate = new Date(year - 4, 0, 1);
        endDate = new Date(year, 11, 31, 23, 59, 59, 999);
        for (let i = 4; i >= 0; i--) {
            const y = year - i;
            buckets.push({
                label: String(y), key: String(y),
                start: new Date(y, 0, 1), end: new Date(y, 11, 31, 23, 59, 59, 999),
                income: 0, expense: 0, count: 0
            });
        }
    } else if (period === 'monthly') {
        // 12 Bulan di Tahun Ini
        const year = now.getFullYear();
        startDate = new Date(year, 0, 1);
        endDate = new Date(year, 11, 31, 23, 59, 59, 999);
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];
        for (let i = 0; i < 12; i++) {
            buckets.push({
                label: monthNames[i], key: `${year}-${String(i+1).padStart(2, '0')}`,
                start: new Date(year, i, 1), end: new Date(year, i + 1, 0, 23, 59, 59, 999),
                income: 0, expense: 0, count: 0
            });
        }
    } else if (period === 'weekly') {
        // 12 Minggu Terakhir (Berakhir minggu ini)
        const dayOfWeek = now.getDay();
        const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
        const currentMonday = new Date(now);
        currentMonday.setDate(now.getDate() + diffToMonday);
        currentMonday.setHours(0,0,0,0);

        startDate = new Date(currentMonday);
        startDate.setDate(currentMonday.getDate() - (11 * 7)); // Mundur 11 minggu
        endDate = new Date(currentMonday);
        endDate.setDate(currentMonday.getDate() + 6); // Hari Minggu
        endDate.setHours(23,59,59,999);

        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];
        for (let i = 11; i >= 0; i--) {
            const wStart = new Date(currentMonday);
            wStart.setDate(currentMonday.getDate() - (i * 7));
            const wEnd = new Date(wStart);
            wEnd.setDate(wStart.getDate() + 6);
            wEnd.setHours(23,59,59,999);

            buckets.push({
                label: `Mg ${12-i} (${String(wStart.getDate()).padStart(2,'0')} ${monthNames[wStart.getMonth()]})`,
                key: `${wStart.getFullYear()}-W${12-i}`,
                start: wStart, end: wEnd,
                income: 0, expense: 0, count: 0
            });
        }
    } else {
        // Default: Daily (14 Hari Terakhir)
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 13);
        startDate.setHours(0,0,0,0);
        endDate = new Date(now);
        endDate.setHours(23,59,59,999);

        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];
        for (let i = 13; i >= 0; i--) {
            const d = new Date(now);
            d.setDate(now.getDate() - i);
            const start = new Date(d); start.setHours(0,0,0,0);
            const end = new Date(d); end.setHours(23,59,59,999);

            buckets.push({
                label: `${String(d.getDate()).padStart(2, '0')} ${monthNames[d.getMonth()]}`,
                key: `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
                start: start, end: end,
                income: 0, expense: 0, count: 0
            });
        }
    }

    // 2. TARIK DATA DARI DATABASE SESUAI RENTANG WAKTU
    const transaksiList = await prisma.transaksi.findMany({
        where: { tanggal: { gte: startDate, lte: endDate }, status: 'Lunas' },
        select: { tanggal: true, total_bayar: true }
    });

    const belanjaList = await prisma.belanjaBahan.findMany({
        where: { tanggal_belanja: { gte: startDate, lte: endDate } },
        select: { tanggal_belanja: true, total_belanja: true }
    });

    // 3. MASUKKAN DATA KE DALAM WADAH GRAFIK (BUCKETS)
    transaksiList.forEach(t => {
        const tTime = t.tanggal.getTime();
        const bucket = buckets.find(b => tTime >= b.start.getTime() && tTime <= b.end.getTime());
        if (bucket) {
            bucket.income += Number(t.total_bayar);
            bucket.count += 1;
        }
    });

    belanjaList.forEach(b => {
        const bTime = b.tanggal_belanja.getTime();
        const bucket = buckets.find(b => bTime >= b.start.getTime() && bTime <= b.end.getTime());
        if (bucket) {
            bucket.expense += Number(b.total_belanja);
        }
    });

    // 4. SUSUN HASIL UNTUK DIKIRIM KE REACT
    const grafik = { labels: [], keys: [], income: [], expense: [], txCount: [] };
    let totalPendapatan = 0;
    let totalPengeluaran = 0;

    buckets.forEach(b => {
        grafik.labels.push(b.label);
        grafik.keys.push(b.key);
        grafik.income.push(b.income);
        grafik.expense.push(b.expense);
        grafik.txCount.push(b.count);
        totalPendapatan += b.income;
        totalPengeluaran += b.expense;
    });

    // 5. MENU TERLARIS (Difilter berdasarkan periode yang dipilih)
    const detailMenuAgregat = await prisma.detailTransaksi.groupBy({
        by: ['id_menu'],
        _sum: { jumlah: true },
        where: { transaksi: { tanggal: { gte: startDate, lte: endDate }, status: 'Lunas' } },
        orderBy: { _sum: { jumlah: 'desc' } },
        take: 5
    });

    const menuTerlaris = await Promise.all(
        detailMenuAgregat.map(async (item) => {
            const menu = await prisma.menu.findUnique({
                where: { id_menu: item.id_menu },
                select: { nama_menu: true, kategori: true }
            });
            return {
                id_menu: item.id_menu,
                nama_menu: menu?.nama_menu || 'Menu Dihapus',
                kategori: menu?.kategori || '-',
                total_terjual: item._sum.jumlah
            };
        })
    );

    // 6. STOK KRITIS (Terintegrasi dengan AI Prediksi Belanja untuk persiapan besok)
    const nowLocal = new Date();
    const besokLocal = new Date(nowLocal);
    besokLocal.setDate(besokLocal.getDate() + 1);
    const tglBesok = `${besokLocal.getFullYear()}-${String(besokLocal.getMonth() + 1).padStart(2, '0')}-${String(besokLocal.getDate()).padStart(2, '0')}`;
    
    // Gunakan getDrafRekomendasi agar tidak meng-overwrite database setiap kali dashboard dimuat
    const rekomendasi = await rekomendasiService.getDrafRekomendasi(tglBesok);
    
    const stokKritis = rekomendasi.slice(0, 5).map(r => ({
        id_bahan: r.bahan.id_bahan,
        nama_bahan: r.bahan.nama_bahan,
        stok: r.bahan.stok,
        satuan: r.bahan.satuan,
        kebutuhan: r.kebutuhan,
        kurang: r.kurang
    }));

    return {
        // Properti ini tetap bernama keuangan_hari_ini agar tidak error di frontend lama,
        // namun nilainya sekarang menyesuaikan filter periode (Total Pemasukan, Total Pengeluaran)
        keuangan_hari_ini: {
            pendapatan: totalPendapatan,
            pengeluaran: totalPengeluaran,
            laba_bersih: totalPendapatan - totalPengeluaran
        },
        grafik, // Mengirimkan Array Grafik ke React
        menu_terlaris: menuTerlaris,
        stok_kritis: stokKritis
    };
};

module.exports = {
    getRingkasanDashboard
};