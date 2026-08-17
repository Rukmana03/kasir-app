const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const prosesClosing = async (data) => {
  // Jalankan dalam transaksi database agar data finansial tidak bocor
  return await prisma.$transaction(async (tx) => {
    const startDate = new Date(`${data.date}T00:00:00.000Z`);
    const endDate = new Date(`${data.date}T23:59:59.999Z`);

    // 1. Hitung total pemasukan dari transaksi yang BELUM di-closing
    const transaksiStats = await tx.transaksi.aggregate({
      _count: { id_transaksi: true },
      _sum: { total_bayar: true },
      where: { id_closing: null, status: "Lunas", tanggal: { gte: startDate, lte: endDate } },
    });

    // 2. Hitung total pengeluaran dari belanja bahan yang BELUM di-closing
    const belanjaStats = await tx.belanjaBahan.aggregate({
      _sum: { total_belanja: true },
      where: { id_closing: null, tanggal_belanja: { gte: startDate, lte: endDate } },
    });

    // Konversi hasil agregasi ke angka
    const jumlahTransaksi = transaksiStats._count.id_transaksi || 0;
    const totalPemasukan = transaksiStats._sum.total_bayar ? parseFloat(transaksiStats._sum.total_bayar) : 0;
    const totalBelanja = belanjaStats._sum.total_belanja ? parseFloat(belanjaStats._sum.total_belanja) : 0;
    const totalBersih = totalPemasukan - totalBelanja;

    // Validasi: Jangan lakukan closing jika restoran tidak ada pergerakan sama sekali
    if (jumlahTransaksi === 0 && totalBelanja === 0) {
      throw new Error("Tidak ada transaksi atau pengeluaran baru yang perlu di-closing.");
    }

    // 3. Buat rekapan Closing Harian
    const closingBaru = await tx.closingHarian.create({
      data: {
        id_user: Number(data.id_user),
        tanggal_closing: startDate,
        jumlah_transaksi: jumlahTransaksi,
        pemasukan: totalPemasukan,
        belanja: totalBelanja,
        total: totalBersih,
      },
      include: {
        user: { select: { nama: true, role: true } },
      },
    });

    // 4. KUNCI TRANSAKSI: Update semua transaksi hari ini dengan id_closing yang baru
    if (jumlahTransaksi > 0) {
      await tx.transaksi.updateMany({
        where: { id_closing: null, status: "Lunas", tanggal: { gte: startDate, lte: endDate } },
        data: { id_closing: closingBaru.id_closing },
      });
    }

    // 5. KUNCI BELANJA: Update semua pengeluaran hari ini dengan id_closing yang baru
    if (totalBelanja > 0) {
      await tx.belanjaBahan.updateMany({
        where: { id_closing: null, tanggal_belanja: { gte: startDate, lte: endDate } },
        data: { id_closing: closingBaru.id_closing },
      });
    }

    return closingBaru;
  });
};

const getRiwayatClosing = async () => {
  return await prisma.closingHarian.findMany({
    include: {
      user: { select: { nama: true } },
    },
    orderBy: {
      tanggal_closing: "desc",
    },
  });
};

const getClosingByDate = async (date) => {
  const startDate = new Date(`${date}T00:00:00.000Z`);
  const endDate = new Date(`${date}T23:59:59.999Z`);

  // 1. Cari Header Closing Harian
  const closing = await prisma.closingHarian.findFirst({
    where: {
      tanggal_closing: { gte: startDate, lte: endDate },
    },
  });

  if (!closing) return null; // Jika belum ada closing hari ini

  // 2. Ambil rincian Transaksi yang terkunci di closing ini
  const transaksiTerkunci = await prisma.transaksi.findMany({
    where: { id_closing: closing.id_closing },
    include: { detail_transaksi: { include: { menu: true } } },
  });

  // 3. Ambil rincian Belanja Bahan yang terkunci di closing ini
  const belanjaTerkunci = await prisma.belanjaBahan.findMany({
    where: { id_closing: closing.id_closing },
    include: { bahan: true },
  });

  // --- PROSES MERAKIT DATA UNTUK REACT --- //

  // A. Kelompokkan berdasarkan Cash / QRIS
  const byMethod = [];
  const cashTx = transaksiTerkunci.filter((t) => (t.metode_pembayaran || "").toLowerCase() === "cash");
  const qrisTx = transaksiTerkunci.filter((t) => (t.metode_pembayaran || "").toLowerCase() === "qris");

  if (cashTx.length > 0) {
    byMethod.push({ method: "cash", count: cashTx.length, total: cashTx.reduce((sum, t) => sum + Number(t.total_bayar), 0) });
  }
  if (qrisTx.length > 0) {
    byMethod.push({ method: "qris", count: qrisTx.length, total: qrisTx.reduce((sum, t) => sum + Number(t.total_bayar), 0) });
  }

  // B. Hitung jumlah item menu terjual
  const items_sold = {};
  transaksiTerkunci.forEach((tx) => {
    tx.detail_transaksi.forEach((dt) => {
      const namaMenu = dt.menu?.nama_menu || "Menu Terhapus";
      if (!items_sold[namaMenu]) items_sold[namaMenu] = 0;
      items_sold[namaMenu] += dt.jumlah;
    });
  });

  // C. Susun daftar belanja (asumsi ada kolom nama_bahan atau keterangan)
  const wet_spend = {};
  belanjaTerkunci.forEach((b) => {
    const namaItem = b.bahan?.nama_bahan || b.bahan?.nama || b.keterangan || `Item #${b.id_bahan || b.id_belanja}`;

    if (!wet_spend[namaItem]) {
      wet_spend[namaItem] = 0;
    }
    wet_spend[namaItem] += Number(b.total_belanja);
  });

  // 4. Kirim dengan format yang dimengerti oleh React
  return {
    ...closing,
    transactions_count: closing.jumlah_transaksi,
    sales_total: Number(closing.pemasukan),
    wet_spend_total: Number(closing.belanja),
    byMethod,
    items_sold,
    wet_spend,
  };
};

const bukaKembaliClosing = async (date) => {
  const startDate = new Date(`${date}T00:00:00.000Z`);
  const endDate = new Date(`${date}T23:59:59.999Z`);

  // 1. Cari data closing pada hari tersebut
  const closing = await prisma.closingHarian.findFirst({
    where: {
      tanggal_closing: { gte: startDate, lte: endDate },
    },
  });

  if (!closing) {
    throw new Error("Data closing tidak ditemukan untuk tanggal ini.");
  }

  // 2. Gunakan Transaction agar proses pelepasan data aman
  return await prisma.$transaction(async (tx) => {
    // Lepaskan ikatan (null) di tabel Transaksi
    await tx.transaksi.updateMany({
      where: { id_closing: closing.id_closing },
      data: { id_closing: null },
    });

    // Lepaskan ikatan (null) di tabel Belanja
    await tx.belanjaBahan.updateMany({
      where: { id_closing: closing.id_closing },
      data: { id_closing: null },
    });

    // Hapus rekaman Closing Harian
    await tx.closingHarian.delete({
      where: { id_closing: closing.id_closing },
    });

    return true;
  });
};

module.exports = {
  prosesClosing,
  getRiwayatClosing,
  getClosingByDate,
  bukaKembaliClosing,
};
