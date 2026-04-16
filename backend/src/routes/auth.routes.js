const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { verifyToken } = require('../middleware/auth.middleware');

router.post('/login', authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);
router.post('/recuperar', authController.recuperar);
router.get('/reset/:token', authController.validarReset);
router.put('/cambiar-password', verifyToken, authController.cambiarPassword);

module.exports = router;
