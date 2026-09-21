const express = require('express');
const router = express.Router();

const { obtener, actualizar, confirmarPagoSaaS, iniciarPagoSaaS } = require('../controllers/configuracion.controller');
const { verifyToken, verifyAdmin } = require('../middleware/auth.middleware');
const { tenantMiddleware } = require('../middleware/tenant.middleware');
const validate = require('../middleware/validate.middleware');
const { actualizarConfiguracionSchema } = require('../validators/configuracion.validator');

router.use(verifyToken, tenantMiddleware);

router.get('/', obtener);
router.patch('/', verifyAdmin, validate(actualizarConfiguracionSchema), actualizar);
router.post('/confirmar-pago-saas', verifyAdmin, confirmarPagoSaaS);
router.post('/iniciar-pago-saas', verifyAdmin, iniciarPagoSaaS);

module.exports = router;
