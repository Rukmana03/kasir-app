const express = require('express');
const router = express.Router();
const dashboardController = require('../Controller/dashboard.controller');

const { verifyToken, checkRole } = require('../middleware/auth.middleware');

router.get('/', [verifyToken, checkRole(['owner'])], dashboardController.getDashboard);

module.exports = router;