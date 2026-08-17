const express = require('express');
const cors = require('cors');
const bahanRoutes = require('../Route/bahan.route');
const userRoutes = require('../Route/user.route');
const menuRoutes = require('../Route/menu.route');
const transaksiRoutes = require('../Route/transaksi.routes');
const mejaRoutes = require('../Route/meja.route');
const penggunaanStokRoutes = require('../Route/penggunaan_stok.route');
const belanjaBahanRoutes = require('../Route/belanja_bahan.route');
const rekomendasiRoutes = require('../Route/rekomendasi.route');
const closingHarianRoutes = require('../Route/closing_harian.route');
const dashboardRoutes = require('../Route/dashboard.route');
const authRoutes = require('../Route/auth.route');
const laporanRoutes = require('../Route/laporan.route');
const app = express();

// Middleware global
app.use(cors());
app.use(express.json()); // Untuk parsing application/json

// Daftarkan routing utama
app.use('/api/bahan', bahanRoutes);
app.use('/api/user', userRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/transaksi', transaksiRoutes);
app.use('/api/meja', mejaRoutes);
app.use('/api/penggunaan_stok', penggunaanStokRoutes);
app.use('/api/belanja_bahan', belanjaBahanRoutes);
app.use('/api/rekomendasi', rekomendasiRoutes);
app.use('/api/closing_harian', closingHarianRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/laporan', laporanRoutes);

module.exports = app;