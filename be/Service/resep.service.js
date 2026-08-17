const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getResepByMenuId = async (id_menu) => {
    return await prisma.komposisiMenu.findMany({
        where: { id_menu: Number(id_menu) },
        include: { 
            bahan: true // Menarik detail nama bahan baku sekaligus
        }
    });
};

const addResep = async (id_menu, data) => {
    return await prisma.komposisiMenu.create({
        data: {
            id_menu: Number(id_menu),
            id_bahan: Number(data.id_bahan),
            jumlah_butuh: Number(data.jumlah_butuh)
        }
    });
};

const deleteResep = async (id_komposisi) => {
    return await prisma.komposisiMenu.delete({
        where: { id_komposisi: Number(id_komposisi) }
    });
};

module.exports = {
    getResepByMenuId,
    addResep,
    deleteResep
};