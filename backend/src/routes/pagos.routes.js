const express = require('express');
const router = express.Router();

const { iniciarPago } = require('../controllers/pagos.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { tenantMiddleware, attachAcueducto } = require('../middleware/tenant.middleware');

router.use(verifyToken, tenantMiddleware, attachAcueducto);

router.post('/iniciar', iniciarPago);

module.exports = router;
