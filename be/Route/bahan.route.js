const express = require('express');
const router = express.Router();
const bahanController = require('../Controller/bahan.controller');

const { verifyToken, checkRole } = require('../middleware/auth.middleware');

router.get('/', [verifyToken, checkRole(['owner'])], bahanController.getAll);
router.get('/:id', [verifyToken, checkRole(['owner'])], bahanController.getById);
router.post('/', [verifyToken, checkRole(['owner'])], bahanController.create);
router.put('/:id', [verifyToken, checkRole(['owner'])], bahanController.update);
router.delete('/:id', [verifyToken, checkRole(['owner'])], bahanController.remove);

module.exports = router;