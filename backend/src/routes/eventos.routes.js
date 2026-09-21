const express = require('express');
const router = express.Router();

const { listar, crear, actualizar, eliminar } = require('../controllers/eventos.controller');
const { verifyToken, verifyAdmin } = require('../middleware/auth.middleware');
const { tenantMiddleware } = require('../middleware/tenant.middleware');
const validate = require('../middleware/validate.middleware');
const { crearEventoSchema, actualizarEventoSchema } = require('../validators/eventos.validator');

// Solo el admin del acueducto gestiona sus propias convocatorias.
router.use(verifyToken, tenantMiddleware, verifyAdmin);

router.get('/', listar);
router.post('/', validate(crearEventoSchema), crear);
router.put('/:id', validate(actualizarEventoSchema), actualizar);
router.delete('/:id', eliminar);

module.exports = router;
