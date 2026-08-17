const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getAllBahan = async () => {
    return await prisma.bahan.findMany();
};

const getBahanById = async (id) => {
    return await prisma.bahan.findUnique({
        where: {
            id_bahan: Number(id)
        }
    });
};

const createBahan = async (data) => {
    return await prisma.bahan.create({
        data: {
            nama_bahan: data.nama_bahan,
            jenis_bahan: data.jenis_bahan,
            satuan: data.satuan,
            stok: Number(data.stok)
        }
    });
};

const upadateBahan = async (id, data) => {
    return await prisma.bahan.update({
        where: { id_bahan:Number(id)},
        data:{
            nama_bahan: data.nama_bahan,
            jenis_bahan: data.jenis_bahan,
            satuan: data.satuan,
            stok: Number(data.stok)
        }
    });
};

const deleteBahan = async (id) => {
    return await prisma.bahan.delete({
        where: {id_bahan: Number(id)}
    });
};

module.exports = {
    getAllBahan,
    getBahanById,
    createBahan,
    upadateBahan,
    deleteBahan
};