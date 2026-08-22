const express = require('express');
const router = express.Router();

const {
  listar,
  obtener,
  crear,
  actualizar,
  eliminar,
  cargarExcel,
} = require('../controllers/asociados.controller');
const { verifyToken, verifyAdmin } = require('../middleware/auth.middleware');
const { tenantMiddleware } = require('../middleware/tenant.middleware');
const { uploadExcel } = require('../middleware/upload.middleware');
const validate = require('../middleware/validate.middleware');
const { crearAsociadoSchema, actualizarAsociadoSchema } = require('../validators/asociados.validator');

router.use(verifyToken, tenantMiddleware);

router.get('/', verifyAdmin, listar);
router.get('/:id', obtener);
router.post('/', verifyAdmin, validate(crearAsociadoSchema), crear);
router.post('/cargar-excel', verifyAdmin, uploadExcel.single('archivo'), cargarExcel);
router.put('/:id', verifyAdmin, validate(actualizarAsociadoSchema), actualizar);
router.delete('/:id', verifyAdmin, eliminar);

module.exports = router;
