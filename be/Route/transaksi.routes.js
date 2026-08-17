const express = require('express');
const router = express.Router();
const transaksiController = require('../Controller/transaksi.controller');

const { verifyToken, checkRole } = require('../middleware/auth.middleware');

router.post('/', [verifyToken, checkRole(['kasir', 'owner'])], transaksiController.createTransaksi);
router.get('/', [verifyToken, checkRole(['kasir', 'owner'])], transaksiController.getAllTransaksi);
router.get('/:id', [verifyToken, checkRole(['kasir', 'owner'])], transaksiController.getById);
router.patch('/:id/payment', [verifyToken, checkRole(['kasir', 'owner'])], transaksiController.updatePayment);

module.exports = router;