const mejaService = require('../Service/meja.service');

const getAll = async (req, res) => {
    try {
        const meja = await mejaService.getAllMeja();
        res.status(200).json({ success: true, data: meja });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getById = async (req, res) => {
    try {
        const meja = await mejaService.getMejaById(req.params.id);
        if (!meja) return res.status(404).json({ success: false, message: 'Meja tidak ditemukan' });
        res.status(200).json({ success: true, data: meja });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const create = async (req, res) => {
    try {
        const mejaBaru = await mejaService.createMeja(req.body);
        res.status(201).json({ success: true, data: mejaBaru, message: 'Meja berhasil ditambahkan' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const update = async (req, res) => {
    try {
        const mejaDiupdate = await mejaService.updateMeja(req.params.id, req.body);
        res.status(200).json({ success: true, data: mejaDiupdate, message: 'Meja berhasil diupdate' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Gagal update meja' });
    }
};

const remove = async (req, res) => {
    try {
        await mejaService.deleteMeja(req.params.id);
        res.status(200).json({ success: true, message: 'Meja berhasil dihapus' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Gagal menghapus meja' });
    }
};

const patchStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status_meja } = req.body;

        // Validasi input status agar tidak diisi sembarang string
        const statusValid = ['Tersedia', 'Terisi'];
        if (!statusValid.includes(status_meja)) {
            return res.status(400).json({ success: false, message: 'Status meja tidak valid! Gunakan Tersedia/Terisi.' });
        }

        const mejaDiupdate = await mejaService.updateStatus(id, status_meja);
        res.status(200).json({ 
            success: true, 
            data: mejaDiupdate, 
            message: `Status meja berhasil diubah menjadi ${status_meja}` 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getAll,
    getById,
    create,
    update,
    remove,
    patchStatus
};