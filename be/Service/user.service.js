const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getAllUser = async () => {
    return await prisma.user.findMany({
        select: {
            id_user: true,
            nama: true,
            username: true,
            role: true
        }
    });
};

const getUserById = async (id) => {
    return await prisma.user.findUnique({
        where: { id_user: Number(id) },
        select: {
            id_user: true,
            nama: true,
            username: true,
            role: true
        }
    });
};

const createUser = async (data) => {
    return await prisma.user.create({
        data: {
            nama: data.nama,
            username: data.username,
            password: data.password,
            role: data.role
        }
    });
};

const updateUser = async (id, data) => {
    return await prisma.user.update({
        where: { id_user: Number(id) },
        data: {
            nama: data.nama,
            username: data.username,
            password: data.password,
            role: data.role
        }
    });
};

const deleteUser = async (id) => {
    return await prisma.user.delete({
        where: { id_user: Number(id) }
    });
};

module.exports = {
    getAllUser,
    getUserById,
    createUser,
    updateUser,
    deleteUser
};