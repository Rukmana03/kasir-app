const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getAllMeja = async () => {
    return await prisma.meja.findMany();
};

const getMejaById = async (id) => {
    return await prisma.meja.findUnique({
        where: { id_meja: Number(id) }
    });
};

const createMeja = async (data) => {
    return await prisma.meja.create({
        data: {
            nomor_meja: data.nomor_meja,
            status_meja: data.status_meja || "Tersedia"
        }
    });
};

const updateMeja = async (id, data) => {
    return await prisma.meja.update({
        where: { id_meja: Number(id) },
        data: {
            nomor_meja: data.nomor_meja,
            status_meja: data.status_meja
        }
    });
};

const deleteMeja = async (id) => {
    return await prisma.meja.delete({
        where: { id_meja: Number(id) }
    });
};

const updateStatus = async (id, status) => {
    return await prisma.meja.update({
        where: { id_meja: Number(id) },
        data: { status_meja: status }
    });
};

module.exports = {
    getAllMeja,
    getMejaById,
    createMeja,
    updateMeja,
    deleteMeja,
    updateStatus
};