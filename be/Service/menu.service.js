const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getAllMenu = async()=>{
    return await prisma.menu.findMany();
}

const getMenuById = async(id)=>{
    return await prisma.menu.findUnique({
        where: {id_menu: Number(id)}
    });
}

const createMenu = async(data)=>{
    return await prisma.menu.create({
        data: {
            nama_menu: data.nama_menu,
            harga: parseFloat(data.harga),
            kategori: data.kategori,
            status_menu: data.status_menu,
        }
    });
}

const updateMenu = async(id, data)=>{
    return await prisma.menu.update({
        where: {id_menu: Number(id)},
        data:{
            nama_menu: data.nama_menu,
            harga: parseFloat(data.harga),
            kategori: data.kategori,
            status_menu: data.status_menu,
        }}
    );
}

const deleteMenu = async(id)=>{
    return await prisma.menu.delete({where: {id_menu: Number(id)}});
}

module.exports = {
    getAllMenu,
    getMenuById,
    createMenu,
    updateMenu,
    deleteMenu
}
