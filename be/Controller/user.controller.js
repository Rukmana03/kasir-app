const userService = require('../Service/user.service');

const getAll = async (req, res) => {
    try {
        const user = await userService.getAllUser();
        res.status(200).json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getById = async (req, res) => {
    try {
        const user = await userService.getUserById(req.params.id);
        if (!user) return res.status(404).json({ success: false, message: 'user tidak ditemukan' });
        res.status(200).json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const create = async (req, res) => {
    try {
        const userBaru = await userService.createUser(req.body);
        res.status(201).json({ success: true, data: userBaru, message: 'user berhasil ditambahkan' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const update = async (req, res) => {
    try {
        const userDiupdate = await userService.updateUser(req.params.id, req.body);
        res.status(200).json({ success: true, data: userDiupdate, message: 'user berhasil diupdate' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Gagal update, pastikan ID benar' });
    }
};

const remove = async (req, res) => {
    try {
        await userService.deleteUser(req.params.id);
        res.status(200).json({ success: true, message: 'user berhasil dihapus' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Gagal menghapus user' });
    }
};

module.exports = {
    getAll,
    getById,
    create,
    update,
    remove
};