const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const getLaporanBulanan = async (month) => {
  // Parameter month berformat 'YYYY-MM' (contoh: '2026-07')
  const [year, monthStr] = month.split("-");

  // Tentukan rentang waktu bulan yang dipilih
  const startDate = new Date(`${year}-${monthStr}-01T00:00:00.000Z`);

  const nextMonth = Number(monthStr) === 12 ? 1 : Number(monthStr) + 1;
  const nextYear = Number(monthStr) === 12 ? Number(year) + 1 : Number(year);
  const endDate = new Date(`${nextYear}-${String(nextMonth).padStart(2, "0")}-01T00:00:00.000Z`);

  // 1. Ambil data asli dari database
  const riwayatClosing = await prisma.closingHarian.findMany({
    where: {
      tanggal_closing: {
        gte: startDate,
        lt: endDate,
      },
    },
  });

  // 2. Cari tahu ada berapa hari di bulan ini (28, 29, 30, atau 31)
  const lastDayOfMonth = new Date(year, monthStr, 0).getDate();

  const detail_harian = [];
  let total_pemasukan = 0;
  let total_belanja = 0;
  let total_transaksi = 0;

  // 3. LOGIKA BARU: Looping dari tanggal 1 sampai akhir bulan
  for (let i = 1; i <= lastDayOfMonth; i++) {
    const dayString = String(i).padStart(2, "0");
    const dateString = `${year}-${monthStr}-${dayString}`; // Contoh: '2026-07-05'

    // Cari apakah ada data closing di database pada tanggal ini
    const closingData = riwayatClosing.find((c) => {
      // Kita potong string format ISO-nya untuk mencocokkan YYYY-MM-DD
      return new Date(c.tanggal_closing).toISOString().startsWith(dateString);
    });

    if (closingData) {
      // Jika ADA TRANSAKSI/CLOSING di tanggal tersebut
      detail_harian.push({
        id_closing: closingData.id_closing,
        tanggal: closingData.tanggal_closing,
        jumlah_transaksi: closingData.jumlah_transaksi,
        pemasukan: Number(closingData.pemasukan),
        belanja: Number(closingData.belanja),
        total_bersih: Number(closingData.total),
      });

      // Tambahkan ke kalkulasi total bulanan
      total_pemasukan += Number(closingData.pemasukan);
      total_belanja += Number(closingData.belanja);
      total_transaksi += Number(closingData.jumlah_transaksi);
    } else {
      // Jika TIDAK ADA TRANSAKSI (Tutup/Libur), buat baris berisi angka 0
      detail_harian.push({
        id_closing: null,
        tanggal: new Date(`${dateString}T00:00:00.000Z`), // Tanggal tetap dicetak
        jumlah_transaksi: 0,
        pemasukan: 0,
        belanja: 0,
        total_bersih: 0,
      });
    }
  }

  return {
    summary: {
      total_pemasukan,
      total_belanja,
      total_bersih: total_pemasukan - total_belanja,
      total_transaksi,
    },
    detail_harian,
  };
};

module.exports = {
  getLaporanBulanan,
};
