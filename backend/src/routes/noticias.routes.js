const express = require('express');
const router = express.Router();
const { verifyToken, verifyAdmin } = require('../middleware/auth.middleware');
const ctrl = require('../controllers/noticias.controller');

// Públicas
router.get('/',    ctrl.listar);
router.get('/:id', ctrl.obtenerPorId);

// Solo admin
router.get('/admin/todas', verifyToken, verifyAdmin, ctrl.listarTodas);
router.post('/',           verifyToken, verifyAdmin, ctrl.crear);
router.put('/:id',         verifyToken, verifyAdmin, ctrl.actualizar);
router.delete('/:id',      verifyToken, verifyAdmin, ctrl.eliminar);

module.exports = router;
