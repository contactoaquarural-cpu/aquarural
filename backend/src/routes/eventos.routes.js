const express = require('express');
const router = express.Router();
const eventosController = require('../controllers/eventos.controller');
const { verifyToken, verifyAdmin } = require('../middleware/auth.middleware');

// Rutas para asociados (autenticados)
router.get('/mis-eventos',      verifyToken, eventosController.misEventos);
router.get('/pendientes',       verifyToken, eventosController.pendientes);
router.post('/:id/confirmar',   verifyToken, eventosController.confirmar);

// Rutas de admin
router.get('/',         verifyToken, verifyAdmin, eventosController.listar);
router.post('/',        verifyToken, verifyAdmin, eventosController.crear);
router.put('/:id',      verifyToken, verifyAdmin, eventosController.actualizar);
router.delete('/:id',   verifyToken, verifyAdmin, eventosController.eliminar);

module.exports = router;
