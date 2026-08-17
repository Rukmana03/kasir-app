const express = require('express');
const router = express.Router();
const mejaController = require('../Controller/meja.controller');

const { verifyToken, checkRole } = require('../middleware/auth.middleware');

router.get('/', [verifyToken, checkRole(['owner', 'kasir'])], mejaController.getAll);
router.get('/:id', [verifyToken, checkRole(['owner', 'kasir'])], mejaController.getById);
router.post('/', [verifyToken, checkRole(['owner'])], mejaController.create);
router.put('/:id', [verifyToken, checkRole(['owner'])], mejaController.update);
router.delete('/:id', [verifyToken, checkRole(['owner'])], mejaController.remove);
router.patch('/:id/status', [verifyToken, checkRole(['kasir'])], mejaController.patchStatus);

module.exports = router;