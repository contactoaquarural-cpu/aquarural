const express = require('express');
const router = express.Router();
const fincasController = require('../controllers/fincas.controller');
const { verifyToken } = require('../middleware/auth.middleware');

router.post('/', verifyToken, fincasController.crear);
router.get('/:id', verifyToken, fincasController.obtenerPorId);
router.put('/:id', verifyToken, fincasController.actualizar);

module.exports = router;
