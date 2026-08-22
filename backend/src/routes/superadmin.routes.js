const express = require('express');
const router = express.Router();

const {
  crearAcueducto,
  listarAcueductos,
  obtenerAcueducto,
  actualizarAcueducto,
} = require('../controllers/superadmin.controller');
const { verifyToken, verifySuperadmin } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const { crearAcueductoSchema, actualizarAcueductoSchema } = require('../validators/superadmin.validator');

router.use(verifyToken, verifySuperadmin);

router.post('/acueductos', validate(crearAcueductoSchema), crearAcueducto);
router.get('/acueductos', listarAcueductos);
router.get('/acueductos/:id', obtenerAcueducto);
router.put('/acueductos/:id', validate(actualizarAcueductoSchema), actualizarAcueducto);

module.exports = router;
