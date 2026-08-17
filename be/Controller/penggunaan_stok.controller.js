const penggunaanStokService = require('../Service/penggunaan_stok.service');

const create = async (req, res) => {
    try {
        const payload = {
            ...req.body,
            id_user: req.user.id_user
        };
        const penggunaan = await penggunaanStokService.createPenggunaan(payload);
        res.status(201).json({ 
            success: true, 
            data: penggunaan, 
            message: 'Penggunaan stok berhasil dicatat dan stok bahan telah dikurangi' 
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

const getAll = async (req, res) => {
    try {
        const { tanggal } = req.query;
        const penggunaan = await penggunaanStokService.getAllPenggunaan(tanggal);
        res.status(200).json({ success: true, data: penggunaan });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    create,
    getAll
};