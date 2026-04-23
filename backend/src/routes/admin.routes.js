const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { verifyToken, verifyAdmin } = require('../middleware/auth.middleware');

router.get('/reportes/morosos',     verifyToken, verifyAdmin, adminController.reporteMorosos);
router.get('/reportes/financiero',  verifyToken, verifyAdmin, adminController.reporteFinanciero);
router.post('/notificaciones/enviar', verifyToken, verifyAdmin, adminController.enviarNotificacionMasiva);

module.exports = router;
