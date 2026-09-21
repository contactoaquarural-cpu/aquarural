const express = require('express');
const router = express.Router();

const { login, login_asociado, refresh, logout, cambiarPassword, verificarPassword } = require('../controllers/auth.controller');
const { verifyToken, verifyAdmin } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const {
  loginSchema,
  loginAsociadoSchema,
  refreshSchema,
  cambiarPasswordSchema,
  verificarPasswordSchema,
} = require('../validators/auth.validator');

router.post('/login', validate(loginSchema), login);
router.post('/login-asociado', validate(loginAsociadoSchema), login_asociado);
router.post('/refresh', validate(refreshSchema), refresh);
router.post('/logout', logout);
router.put('/cambiar-password', verifyToken, verifyAdmin, validate(cambiarPasswordSchema), cambiarPassword);
router.post('/verificar-password', verifyToken, verifyAdmin, validate(verificarPasswordSchema), verificarPassword);

module.exports = router;
