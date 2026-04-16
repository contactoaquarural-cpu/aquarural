const express = require('express');
const router = express.Router();
const asociadosController = require('../controllers/asociados.controller');
const fincasController = require('../controllers/fincas.controller');
const { verifyToken, verifyAdmin } = require('../middleware/auth.middleware');
const { handleUpload } = require('../middleware/upload.middleware');

router.post('/', asociadosController.registrar);
router.get('/', verifyToken, asociadosController.listar);
router.get('/:id', verifyToken, asociadosController.obtenerPorId);
router.put('/:id', verifyToken, asociadosController.actualizar);
router.patch('/:id/estado', verifyToken, verifyAdmin, asociadosController.cambiarEstado);
router.post('/:id/foto', verifyToken, handleUpload, asociadosController.subirFoto);
router.get('/:id/qr', verifyToken, asociadosController.obtenerQR);
router.get('/:id/fincas', verifyToken, fincasController.listarPorAsociado);
router.get('/:id/aportes', verifyToken, asociadosController.historialAportes);
router.get('/:id/notificaciones', verifyToken, asociadosController.historialNotificaciones);

module.exports = router;
