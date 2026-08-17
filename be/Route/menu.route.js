const express = require('express');
const router = express.Router();
const menuController = require('../Controller/menu.controller');
const resepController = require('../Controller/resep.controller');

const { verifyToken, checkRole } = require('../middleware/auth.middleware');

router.get('/', [verifyToken, checkRole(['owner', 'kasir'])], menuController.getAll);
router.get('/:id', [verifyToken, checkRole(['owner', 'kasir'])], menuController.getById);
router.post('/', [verifyToken, checkRole(['owner'])], menuController.create);
router.put('/:id', [verifyToken, checkRole(['owner'])], menuController.update);
router.delete('/:id', [verifyToken, checkRole(['owner'])], menuController.remove);

router.get('/:id/resep', [verifyToken, checkRole(['owner'])], resepController.getResepMenu);
router.post('/:id/resep', [verifyToken, checkRole(['owner'])], resepController.tambahResepMenu);
router.delete('/resep/:id', [verifyToken, checkRole(['owner'])], resepController.hapusResepMenu);

module.exports = router;