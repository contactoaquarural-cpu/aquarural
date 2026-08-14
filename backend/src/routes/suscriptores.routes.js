const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const tenantMiddleware = require('../middleware/tenant.middleware');
const {
  crearSuscriptor,
  obtenerSuscriptores,
  actualizarUbicacionGPS,
  cargarMasivaExcel,
} = require('../controllers/suscriptores.controller');

// Rutas de Suscriptores (Requieren header de Acueducto)
router.use(tenantMiddleware);

router.post('/', crearSuscriptor);
router.get('/', obtenerSuscriptores);
router.patch('/:id/gps', actualizarUbicacionGPS);
router.post('/cargar-excel', upload.single('archivo'), cargarMasivaExcel);

module.exports = router;
