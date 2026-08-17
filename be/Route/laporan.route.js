const express = require('express');
const router = express.Router();
const laporanController = require('../Controller/laporan.controller');

const { verifyToken, checkRole } = require('../middleware/auth.middleware');

// Laporan bulanan bisa diakses oleh owner (dan kasir jika diperlukan)
router.get('/bulanan', [verifyToken, checkRole(['owner'])], laporanController.getLaporanBulanan);

module.exports = router;