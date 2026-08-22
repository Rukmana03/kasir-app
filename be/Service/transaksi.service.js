const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const createTransaksi = async (data) => {

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const sudahClosing = await prisma.closingHarian.findFirst({
        where: {
        tanggal_closing: { gte: startOfDay, lte: endOfDay },
        },
    });

    // Jika data closing ditemukan, langsung TOLAK transaksi!
    if (sudahClosing) {
        throw new Error("KASIR TERKUNCI: Laporan Closing hari ini sudah dibuat. Silakan 'Reopen' laporan untuk menerima pesanan.");
    }
  
    return await prisma.$transaction(async (tx) => {
    // 1. Ambil data nominal dari payload
    const totalBayar = parseFloat(data.total_bayar);
    const metodePembayaran = data.metode_pembayaran.toLowerCase();

    // Default nilai untuk pembayaran non-cash (QRIS)
    let nominalUangDiterima = totalBayar;
    let kembalian = 0;

    // 2. Validasi & Kalkulasi jika metode pembayaran adalah Cash
    if (metodePembayaran === "cash") {
      if (!data.uang_diterima || parseFloat(data.uang_diterima) < totalBayar) {
        throw new Error("Uang yang diterima kurang dari total bayar!");
      }
      nominalUangDiterima = parseFloat(data.uang_diterima);
      kembalian = nominalUangDiterima - totalBayar;
    }
    // 1. Buat data header transaksi
    const transaksiBaru = await tx.transaksi.create({
      data: {
        id_user: Number(data.id_user),
        jenis_transaksi: data.jenis_transaksi, // 'dine-in' atau 'takeaway'
        metode_pembayaran: data.metode_pembayaran, // 'cash' atau 'qris'
        total_bayar: totalBayar,
        status: data.status || "Lunas",
        id_meja: data.id_meja ? Number(data.id_meja) : null, // Null jika takeaway

        // 2. Simpan item detail transaksi secara nested
        detail_transaksi: {
          create: data.items.map((item) => ({
            id_menu: Number(item.id_menu),
            jumlah: Number(item.jumlah),
            harga: parseFloat(item.harga),
            subtotal: parseFloat(item.subtotal),
          })),
        },
      },
      include: {
        // Sesuai class diagram, kita join ke tabel menu untuk mendapatkan nama menu saat cetak struk
        detail_transaksi: {
          include: {
            menu: true,
          },
        },
        user: {
          select: {
            nama: true, // Agar tahu nama kasir yang mencetak struk
          },
        },
      },
    });

    return {
      ...transaksiBaru,
      uang_diterima: nominalUangDiterima,
      kembalian: kembalian,
    };
  });
};

const getAllTransaksi = async (date) => {
  let whereClause = {};

  // Jika ada parameter tanggal dari frontend, buat batasan jam 00:00 - 23:59
  if (date) {
    const startDate = new Date(`${date}T00:00:00.000Z`);
    const endDate = new Date(`${date}T23:59:59.999Z`);

    whereClause.tanggal = {
      gte: startDate,
      lte: endDate,
    };
  }
  return await prisma.transaksi.findMany({
    where: whereClause, // Masukkan filter ke sini
    include: {
      user: {
        select: { nama: true, role: true },
      },
      meja: true,
      detail_transaksi: {
        include: {
          menu: true,
        },
      },
    },
    orderBy: {
      tanggal: "desc",
    },
  });
};

const getTransaksiById = async (id) => {
  return await prisma.transaksi.findUnique({
    where: { id_transaksi: Number(id) },
    include: {
      user: {
        select: { nama: true, role: true },
      },
      meja: true,
      detail_transaksi: {
        include: {
          menu: true,
        },
      },
    },
  });
};

const updateMetodePembayaran = async (id, metode_pembayaran) => {
  return await prisma.transaksi.update({
    where: { id_transaksi: Number(id) },
    data: { metode_pembayaran },
  });
};

module.exports = {
  createTransaksi,
  getAllTransaksi,
  getTransaksiById,
  updateMetodePembayaran,
};
