const menuService = require("../Service/menu.service");

const getAll = async(req, res)=>{
    try{
        const menu = await menuService.getAllMenu();
        res.status(200).json({success: true, data: menu});
    }catch(error){
        res.status(500).json({success: false, message: error.message});
    }
};

const getById = async(req, res)=>{
    try{
        const menu = await menuService.getMenuById(req.params.id);
        if (!menu) return res.status(404).json({message: "Menu tidak ditemukan"});
        res.status(200).json({success: true, data: menu});
    }catch(error){
        res.status(500).json({message: error.message});
    }
};

const create = async(req, res)=>{
    try{
        const menu = await menuService.createMenu(req.body);
        res.status(200).json({success: true, data: menu, message: 'Menu berhasil ditambahkan'});
    }catch(error){
        res.status(500).json({message: error.message});
    }
};

const update = async(req, res)=>{
    try{
        const menu = await menuService.updateMenu(req.params.id, req.body);
        res.status(200).json({success: true, data: menu, message: 'Menu berhasil diupdate'});
    }catch(error){
        res.status(500).json({success: false, message: 'Gagal update, pastikan ID benar'});
    }
};

const remove = async(req, res)=>{
    try{
        await menuService.deleteMenu(req.params.id);
        res.status(200).json({success: true, message: 'Menu berhasil dihapus'});
    }catch(error){
        res.status(500).json({success: false, message: 'Gagal menghapus menu'});
    }
};

module.exports = {
    getAll,
    getById,
    create,
    update,
    remove
};
