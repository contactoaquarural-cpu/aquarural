const express = require('express');
const router = express.Router();

const { listar, crear, actualizar, eliminar } = require('../controllers/equipo.controller');
const { verifyToken, verifyAdmin } = require('../middleware/auth.middleware');
const { tenantMiddleware } = require('../middleware/tenant.middleware');
const validate = require('../middleware/validate.middleware');
const { crearMiembroEquipoSchema, actualizarMiembroEquipoSchema } = require('../validators/equipo.validator');

// Solo el admin del acueducto gestiona su propio equipo (tesorero, fontanero).
router.use(verifyToken, tenantMiddleware, verifyAdmin);

router.get('/', listar);
router.post('/', validate(crearMiembroEquipoSchema), crear);
router.put('/:id', validate(actualizarMiembroEquipoSchema), actualizar);
router.delete('/:id', eliminar);

module.exports = router;
