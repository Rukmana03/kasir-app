const transaksiService = require('../Service/transaksi.service');

const createTransaksi = async (req, res) => {
    try {
        const transaksi = await transaksiService.createTransaksi(req.body);
        res.status(201).json({ success: true, data: transaksi, message: 'Transaksi berhasil disimpan dan siap cetak struk' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getAllTransaksi = async (req, res) => {
    try {
        const { date } = req.query;
        
        const transactions = await transaksiService.getAllTransaksi(date);
        res.status(200).json({ success: true, data: transactions });
    } catch (error) {
        console.error("ERROR SAAT AMBIL TRANSAKSI:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const getById = async (req, res) => {
    try {
        const transaksi = await transaksiService.getTransaksiById(req.params.id);
        if (!transaksi) return res.status(404).json({ success: false, message: 'Transaksi tidak ditemukan' });
        res.status(200).json({ success: true, data: transaksi });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const updatePayment = async (req, res) => {
  try {
    const { id } = req.params; // Mengambil ID dari URL
    const { metode_pembayaran } = req.body; // Mengambil CASH/QRIS dari form

    // Panggil fungsi baru di service
    const updatedTx = await transaksiService.updateMetodePembayaran(id, metode_pembayaran);

    res.status(200).json({ success: true, data: updatedTx });
  } catch (error) {
    console.error("Gagal mengubah pembayaran:", error);
    res.status(500).json({ success: false, message: "Gagal update metode pembayaran", error: error.message });
  }
};

module.exports = {
    createTransaksi,
    getAllTransaksi,
    getById,
    updatePayment
};