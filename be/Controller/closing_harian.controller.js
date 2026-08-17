const closingHarianService = require('../Service/closing_harian.service');

const create = async (req, res) => {
    try {
      const payload = {
            ...req.body,
            id_user: req.user ? req.user.id_user : 1
        };
        const closing = await closingHarianService.prosesClosing(payload);
        res.status(201).json({ 
            success: true, 
            data: closing, 
            message: 'Closing harian berhasil diproses dan data transaksi telah dikunci' 
        });
    } catch (error) {
        console.error("ERROR CREATE CLOSING:", error);
        res.status(400).json({ success: false, message: error.message });
    }
};

const getClosing = async (req, res) => {
  try {
    const { date } = req.query;

    // Jika React meminta data berdasarkan tanggal tertentu (?date=...)
    if (date) {
      const closingData = await closingHarianService.getClosingByDate(date);

      if (!closingData) {
        return res.status(404).json({ success: false, message: "Belum ada closing untuk tanggal ini." });
      }
      return res.status(200).json({ success: true, data: closingData });
    } 
    // Jika tidak ada parameter tanggal (Misal untuk tabel Laporan Bulanan)
    else {
      const closingAll = await closingHarianService.getRiwayatClosing();
      return res.status(200).json({ success: true, data: closingAll });
    }

  } catch (error) {
    console.error("ERROR GET CLOSING:", error);
    res.status(500).json({ success: false, message: "Terjadi kesalahan server", error: error.message });
  }
};

const reopenClosing = async (req, res) => {
    try {
        const { date } = req.query;
        if (!date) {
            return res.status(400).json({ success: false, message: "Parameter tanggal (date) wajib disertakan." });
        }

        await closingHarianService.bukaKembaliClosing(date);
        res.status(200).json({ success: true, message: "Closing berhasil dibuka kembali." });
    } catch (error) {
        console.error("ERROR REOPEN CLOSING:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    create,
    reopenClosing,
    getClosing
};