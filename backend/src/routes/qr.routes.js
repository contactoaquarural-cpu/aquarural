const express = require('express');
const router = express.Router();
const qrController = require('../controllers/qr.controller');

router.post('/verificar', qrController.verificar); // público — comercios aliados

module.exports = router;
