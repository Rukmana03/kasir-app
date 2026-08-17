const express = require('express');
const router = express.Router();
const cetakController = require('../Controller/cetak.controller');

// Endpoint untuk perintah cetak dari frontend
router.post('/struk', cetakController.printStruk);

module.exports = router;