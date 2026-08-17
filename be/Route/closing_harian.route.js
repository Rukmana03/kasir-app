const express = require('express');
const router = express.Router();
const closingHarianController = require('../Controller/closing_harian.controller');

const { verifyToken, checkRole } = require('../middleware/auth.middleware');

router.post('/', [verifyToken, checkRole(['kasir', 'owner'])], closingHarianController.create);
router.get('/', [verifyToken, checkRole(['kasir', 'owner'])], closingHarianController.getClosing);
router.delete('/', [verifyToken, checkRole(['kasir', 'owner'])], closingHarianController.reopenClosing);

module.exports = router;