const express = require('express');
const router = express.Router();

const {
  listar,
  crear,
  actualizar,
  eliminar,
  misEventos,
  confirmarAsistencia,
} = require('../controllers/eventos.controller');
const { verifyToken, verifyAdmin } = require('../middleware/auth.middleware');
const { tenantMiddleware } = require('../middleware/tenant.middleware');
const validate = require('../middleware/validate.middleware');
const {
  crearEventoSchema,
  actualizarEventoSchema,
  confirmarAsistenciaSchema,
} = require('../validators/eventos.validator');

router.use(verifyToken, tenantMiddleware);

// Rutas del suscriptor — cualquier rol autenticado del acueducto, no solo admin.
router.get('/mis-eventos', misEventos);
router.post('/:id/confirmar', validate(confirmarAsistenciaSchema), confirmarAsistencia);

// Solo el admin del acueducto gestiona sus propias convocatorias.
router.get('/', verifyAdmin, listar);
router.post('/', verifyAdmin, validate(crearEventoSchema), crear);
router.put('/:id', verifyAdmin, validate(actualizarEventoSchema), actualizar);
router.delete('/:id', verifyAdmin, eliminar);

module.exports = router;
