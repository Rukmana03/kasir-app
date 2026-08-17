const resepService = require('../Service/resep.service');

const getResepMenu = async (req, res) => {
    try {
        const resep = await resepService.getResepByMenuId(req.params.id);
        res.status(200).json({ success: true, data: resep });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const tambahResepMenu = async (req, res) => {
    try {
        const newResep = await resepService.addResep(req.params.id, req.body);
        res.status(201).json({ success: true, data: newResep });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const hapusResepMenu = async (req, res) => {
    try {
        await resepService.deleteResep(req.params.id);
        res.status(200).json({ success: true, message: "Bahan berhasil dihapus dari resep." });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getResepMenu,
    tambahResepMenu,
    hapusResepMenu
};