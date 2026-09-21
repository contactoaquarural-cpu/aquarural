const express = require('express');
const router = express.Router();

const {
  crearAcueducto,
  listarAcueductos,
  obtenerAcueducto,
  actualizarAcueducto,
  eliminarAcueducto,
  obtenerMetricas,
  obtenerConfiguracionGlobal,
  actualizarConfiguracionGlobal,
  subirImagenApariencia,
  iniciarPagoSaaS,
  webhookPagoSaaS,
} = require('../controllers/superadmin.controller');
const { verifyToken, verifySuperadmin } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const { uploadImagen } = require('../middleware/upload.middleware');
const {
  crearAcueductoSchema,
  actualizarAcueductoSchema,
  actualizarConfiguracionGlobalSchema,
} = require('../validators/superadmin.validator');

// Lectura pública: landing y web-admin (Login) consumen la apariencia global
// sin autenticación, antes de que exista una sesión.
router.get('/configuracion-global', obtenerConfiguracionGlobal);

// Webhook público de Wompi para el cobro de licencias SaaS — verificado por
// firma HMAC dentro del controller, no por JWT (Wompi no tiene tu token).
router.post('/pago-saas/webhook', webhookPagoSaaS);

router.use(verifyToken, verifySuperadmin);

router.post('/acueductos', validate(crearAcueductoSchema), crearAcueducto);
router.get('/acueductos', listarAcueductos);
router.get('/acueductos/:id', obtenerAcueducto);
router.put('/acueductos/:id', validate(actualizarAcueductoSchema), actualizarAcueducto);
router.delete('/acueductos/:id', eliminarAcueducto);
router.get('/metricas', obtenerMetricas);

router.post('/pago-saas/iniciar', iniciarPagoSaaS);

router.patch('/configuracion-global', validate(actualizarConfiguracionGlobalSchema), actualizarConfiguracionGlobal);
router.post('/configuracion-global/imagen', uploadImagen.single('imagen'), subirImagenApariencia);

module.exports = router;
