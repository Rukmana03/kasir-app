const express = require('express');
const router = express.Router();
const penggunaanStokController = require('../Controller/penggunaan_stok.controller');

const { verifyToken, checkRole } = require('../middleware/auth.middleware');

router.post('/', [verifyToken, checkRole(['owner'])], penggunaanStokController.create);
router.get('/', [verifyToken, checkRole(['owner'])], penggunaanStokController.getAll);

module.exports = router;