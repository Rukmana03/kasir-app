const express = require('express');
const router = express.Router();
const rekomendasiController = require('../Controller/rekomendasi.controller');

router.get('/generate', rekomendasiController.generate);
router.get('/draf', rekomendasiController.getDraf);
router.post('/kalkulator', rekomendasiController.hitungKalkulator);

module.exports = router;