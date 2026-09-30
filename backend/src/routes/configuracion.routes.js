const express = require('express');
const router = express.Router();

const { obtener, obtenerPublica, actualizar, confirmarPagoSaaS, iniciarPagoSaaS } = require('../controllers/configuracion.controller');
const { verifyToken, verifyAdmin } = require('../middleware/auth.middleware');
const { tenantMiddleware } = require('../middleware/tenant.middleware');
const validate = require('../middleware/validate.middleware');
const { actualizarConfiguracionSchema } = require('../validators/configuracion.validator');

router.use(verifyToken, tenantMiddleware);

// Antes de la ruta genérica '/' — accesible a cualquier rol (incluido
// ASOCIADO), a diferencia del resto de este archivo que es solo admin.
router.get('/publica', obtenerPublica);

router.get('/', obtener);
router.patch('/', verifyAdmin, validate(actualizarConfiguracionSchema), actualizar);
router.post('/confirmar-pago-saas', verifyAdmin, confirmarPagoSaaS);
router.post('/iniciar-pago-saas', verifyAdmin, iniciarPagoSaaS);

module.exports = router;
