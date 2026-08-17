const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../Service/auth.service');

// 1. Fungsi untuk memastikan yang mengakses punya tiket (Token) yang valid
const verifyToken = (req, res, next) => {
    // Ambil header authorization (Format: "Bearer <token>")
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(403).json({ success: false, message: 'Akses ditolak! Token tidak ditemukan.' });
    }

    try {
        // Dekode token
        const decoded = jwt.verify(token, JWT_SECRET);
        // Simpan data user dari token ke dalam request agar bisa dipakai oleh controller
        req.user = decoded; 
        next(); // Loloskan ke tahap berikutnya
    } catch (error) {
        return res.status(401).json({ success: false, message: 'Token tidak valid atau sudah kedaluwarsa!' });
    }
};

// 2. Fungsi untuk mengecek hak akses (Role)
const checkRole = (allowedRoles) => {
    return (req, res, next) => {
        // Cek apakah role dari user yang sedang login ada di dalam daftar allowedRoles
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ 
                success: false, 
                message: `Akses ditolak! Anda login sebagai ${req.user.role}, halaman ini hanya untuk: ${allowedRoles.join(', ')}` 
            });
        }
        next(); // Loloskan
    };
};

module.exports = {
    verifyToken,
    checkRole
};