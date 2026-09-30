const express = require('express');
const router = express.Router();

const {
  listar,
  generarMasiva,
  anularPeriodo,
  pagoEfectivo,
  descargarPdf,
  webhookWompi,
} = require('../controllers/facturas.controller');
const { verifyToken, verifyAdmin } = require('../middleware/auth.middleware');
const { tenantMiddleware } = require('../middleware/tenant.middleware');
const validate = require('../middleware/validate.middleware');
const { generarMasivaSchema, pagoEfectivoSchema } = require('../validators/facturas.validator');

// Webhook público, verificado por firma HMAC dentro del controller, no por JWT.
router.post('/webhook-wompi', webhookWompi);

router.use(verifyToken, tenantMiddleware);

router.get('/', listar);
router.get('/:id/pdf', descargarPdf);
router.post('/generar-masiva', verifyAdmin, validate(generarMasivaSchema), generarMasiva);
router.delete('/anular-periodo', verifyAdmin, anularPeriodo);
router.post('/:id/pago-efectivo', verifyAdmin, validate(pagoEfectivoSchema), pagoEfectivo);

module.exports = router;
