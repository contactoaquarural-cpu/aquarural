const express = require('express');
const router = express.Router();

const { financiero, morosos } = require('../controllers/reportes.controller');
const { verifyToken, verifyAdmin } = require('../middleware/auth.middleware');
const { tenantMiddleware } = require('../middleware/tenant.middleware');

// Solo el admin del acueducto ve sus propios reportes financieros.
router.use(verifyToken, tenantMiddleware, verifyAdmin);

router.get('/financiero', financiero);
router.get('/morosos', morosos);

module.exports = router;
