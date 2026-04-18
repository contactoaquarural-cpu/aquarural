const express = require('express');
const router = express.Router();
const preciosController = require('../controllers/precios.controller');
const { verifyToken, verifyAdmin } = require('../middleware/auth.middleware');

router.get('/',        preciosController.listar);
router.post('/',       verifyToken, verifyAdmin, preciosController.crear);
router.put('/:id',     verifyToken, verifyAdmin, preciosController.actualizar);
router.delete('/:id',  verifyToken, verifyAdmin, preciosController.eliminar);

module.exports = router;
