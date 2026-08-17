const express = require('express');
const router = express.Router();
const belanjaBahanController = require('../Controller/belanja_bahan.controller');

const { verifyToken, checkRole } = require('../middleware/auth.middleware');

router.post('/', [verifyToken, checkRole(['kasir', 'owner'])], belanjaBahanController.create);
router.get('/', [verifyToken, checkRole(['kasir', 'owner'])], belanjaBahanController.getAll);

module.exports = router;