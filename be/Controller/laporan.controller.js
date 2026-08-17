const laporanService = require('../Service/laporan.service');

const getLaporanBulanan = async (req, res) => {
    try {
        const { month } = req.query; // Menerima parameter ?month=2026-07

        if (!month) {
            return res.status(400).json({ success: false, message: "Parameter bulan (month) wajib disertakan dengan format YYYY-MM." });
        }

        const data = await laporanService.getLaporanBulanan(month);
        
        res.status(200).json({ success: true, data });
    } catch (error) {
        console.error("ERROR GET LAPORAN BULANAN:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getLaporanBulanan
};