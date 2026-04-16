const express = require('express');
const router = express.Router();
const pagosController = require('../controllers/pagos.controller');
const { verifyToken } = require('../middleware/auth.middleware');

router.post('/iniciar', verifyToken, pagosController.iniciar);
router.post('/webhook', pagosController.webhook); // público — Wompi llama aquí

module.exports = router;
