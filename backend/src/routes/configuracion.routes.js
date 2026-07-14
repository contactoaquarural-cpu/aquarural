const express = require('express');
const { obtener, actualizar } = require('../controllers/configuracion.controller');
const { verifyToken, verifyAdmin } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/',  obtener);
router.patch('/', verifyToken, verifyAdmin, actualizar);

module.exports = router;
