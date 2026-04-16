const express = require('express');
const router = express.Router();
const asociadosController = require('../controllers/asociados.controller');
const { verifyToken, verifyAdmin } = require('../middleware/auth.middleware');

router.post('/', asociadosController.registrar);
router.get('/', verifyToken, asociadosController.listar);
router.get('/:id', verifyToken, asociadosController.obtenerPorId);
router.put('/:id', verifyToken, asociadosController.actualizar);
router.patch('/:id/estado', verifyToken, verifyAdmin, asociadosController.cambiarEstado);
router.get('/:id/aportes', verifyToken, asociadosController.historialAportes);
router.get('/:id/notificaciones', verifyToken, asociadosController.historialNotificaciones);

module.exports = router;
