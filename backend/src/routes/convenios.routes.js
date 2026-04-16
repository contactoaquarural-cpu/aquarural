const express = require('express');
const router = express.Router();
const conveniosController = require('../controllers/convenios.controller');
const { verifyToken, verifyAdmin } = require('../middleware/auth.middleware');

router.get('/', conveniosController.listar);                                        // público
router.get('/:id', conveniosController.obtenerPorId);                              // público
router.post('/', verifyToken, verifyAdmin, conveniosController.crear);             // admin
router.put('/:id', verifyToken, verifyAdmin, conveniosController.actualizar);      // admin
router.patch('/:id/toggle', verifyToken, verifyAdmin, conveniosController.toggle); // admin

module.exports = router;
