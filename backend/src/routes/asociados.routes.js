const express = require('express');
const router = express.Router();

const {
  listar,
  obtener,
  crear,
  actualizar,
  eliminar,
  cargarExcel,
  previsualizarExcel,
  registrarLecturasMasivas,
  actualizarGps,
  actualizarGpsPropio,
  actualizarPerfilPropio,
  actualizarTokenFCM,
  historialConsumo,
  estadisticasLecturas,
} = require('../controllers/asociados.controller');
const { verifyToken, verifyAdmin, verifyFontanero } = require('../middleware/auth.middleware');
const { tenantMiddleware } = require('../middleware/tenant.middleware');
const { uploadExcel } = require('../middleware/upload.middleware');
const validate = require('../middleware/validate.middleware');
const {
  crearAsociadoSchema,
  actualizarAsociadoSchema,
  actualizarGpsSchema,
  actualizarPerfilPropioSchema,
  actualizarTokenFCMSchema,
} = require('../validators/asociados.validator');
const { registrarLecturasMasivasSchema } = require('../validators/facturas.validator');

router.use(verifyToken, tenantMiddleware);

router.get('/', verifyFontanero, listar);
router.get('/estadisticas-lecturas', verifyFontanero, estadisticasLecturas);
router.get('/:id', obtener);
router.get('/:id/historial-consumo', historialConsumo);
router.post('/', verifyAdmin, validate(crearAsociadoSchema), crear);
router.post('/cargar-excel/previsualizar', verifyAdmin, uploadExcel.single('archivo'), previsualizarExcel);
router.post('/cargar-excel', verifyAdmin, uploadExcel.single('archivo'), cargarExcel);
router.post('/lecturas-masivas', verifyFontanero, validate(registrarLecturasMasivasSchema), registrarLecturasMasivas);
router.patch('/:id/gps', verifyFontanero, validate(actualizarGpsSchema), actualizarGps);
router.patch('/:id/gps-propio', validate(actualizarGpsSchema), actualizarGpsPropio);
router.patch('/:id/perfil-propio', validate(actualizarPerfilPropioSchema), actualizarPerfilPropio);
router.patch('/:id/token-fcm', validate(actualizarTokenFCMSchema), actualizarTokenFCM);
router.put('/:id', verifyAdmin, validate(actualizarAsociadoSchema), actualizar);
router.delete('/:id', verifyAdmin, eliminar);

module.exports = router;
