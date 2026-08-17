const belanjaBahanService = require('../Service/belanja_bahan.service');

const create = async (req, res) => {
    try {
        const payload = {
            ...req.body,
            id_user: req.user.id_user
        };
        const belanja = await belanjaBahanService.createBelanja(payload);
        res.status(201).json({ 
            success: true, 
            data: belanja, 
            message: 'Nota belanja berhasil dicatat dan stok bahan bertambah' 
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

const getAll = async (req, res) => {
    try {
        const { tanggal } = req.query;
        const belanja = await belanjaBahanService.getAllBelanja(tanggal);
        res.status(200).json({ success: true, data: belanja });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    create,
    getAll
};