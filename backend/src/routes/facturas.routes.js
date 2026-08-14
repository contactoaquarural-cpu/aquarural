const express = require('express');
const router = express.Router();
const tenantMiddleware = require('../middleware/tenant.middleware');
const {
  generarFacturacionMasiva,
  consultarDeudaSuscriptor,
  iniciarPagoWompi,
  webhookWompi,
  registrarPagoEfectivo,
} = require('../controllers/facturas.controller');

// Webhook Wompi no requiere tenant middleware ya que viene de servidor a servidor
router.post('/webhook-wompi', webhookWompi);

// Rutas protegidas por acueducto
router.use(tenantMiddleware);

router.post('/generar-masiva', generarFacturacionMasiva);
router.get('/consultar-deuda', consultarDeudaSuscriptor);
router.post('/iniciar-pago-wompi', iniciarPagoWompi);
router.post('/:id/pago-efectivo', registrarPagoEfectivo);

module.exports = router;
