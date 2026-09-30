const express = require('express');
const router = express.Router();

const { misNotificaciones, marcarLeida, marcarTodasLeidas } = require('../controllers/notificaciones.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { tenantMiddleware } = require('../middleware/tenant.middleware');

router.use(verifyToken, tenantMiddleware);

router.get('/', misNotificaciones);
router.patch('/:id/leer', marcarLeida);
router.patch('/leer-todas', marcarTodasLeidas);

module.exports = router;
