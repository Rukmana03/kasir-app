const bahanService = require('../Service/bahan.service');

const getAll = async (req, res) => {
    try {
        const bahan = await bahanService.getAllBahan();
        res.status(200).json({ success: true, data: bahan });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getById = async(req, res)=>{
    try {
        const bahan = await bahanService.getBahanById(req.params.id);
        if (!bahan) return res.status(404).json({success: false, message: "Bahan tidak ditemukan"});
        res.status(200).json({ success: true, data: bahan });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const create = async (req, res) => {
    try {
        const data = req.body;
        const newBahan = await bahanService.createBahan(data);
        res.status(201).json({ success: true, data: newBahan });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const update = async(req,res)=>{
    try {
        const data = req.body;
        const updatedBahan = await bahanService.upadateBahan(req.params.id, data);
        res.status(200).json({ success: true, data: updatedBahan });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const remove = async(req,res)=>{
    try {
        const deletedBahan = await bahanService.deleteBahan(req.params.id);
        res.status(200).json({ success: true, data: deletedBahan });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getAll,
    getById,
    create,
    update,
    remove
};