const rekomendasiService = require('../Service/rekomendasi.service');

const generate = async (req, res) => {
    try {
        const { tanggal } = req.query;
        const rekomendasi = await rekomendasiService.generateRekomendasi(tanggal);
        res.status(200).json({ success: true, data: rekomendasi });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getDraf = async (req, res) => {
    try {
        const { tanggal } = req.query;
        const draf = await rekomendasiService.getDrafRekomendasi(tanggal);
        res.status(200).json({ success: true, data: draf });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const hitungKalkulator = async (req, res) => {
    try {
        const { targetMenu } = req.body;
        
        // Validasi input dari Frontend
        if (!targetMenu || !Array.isArray(targetMenu) || targetMenu.length === 0) {
            return res.status(400).json({ 
                success: false, 
                message: "Target menu tidak boleh kosong" 
            });
        }

        // Panggil fungsi perhitungan di Service
        const hasilKalkulasi = await rekomendasiService.hitungKalkulatorManual(targetMenu);

        // Kembalikan hasil ke Frontend
        return res.status(200).json({ 
            success: true, 
            message: "Kalkulasi berhasil", 
            data: hasilKalkulasi 
        });

    } catch (error) {
        console.error("Error Kalkulator Controller:", error);
        return res.status(500).json({ 
            success: false, 
            message: "Terjadi kesalahan server saat menghitung kalkulasi" 
        });
    }
};

module.exports = {
    generate,
    getDraf,
    hitungKalkulator
};