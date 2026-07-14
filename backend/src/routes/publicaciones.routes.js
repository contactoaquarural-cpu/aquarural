const router = require('express').Router();
const ctrl   = require('../controllers/publicaciones.controller');
const { verifyToken, verifyAdmin } = require('../middleware/auth.middleware');
const { handleUploadMultiple }     = require('../middleware/upload.middleware');

// Públicos
router.get('/',     ctrl.listar);
router.get('/:id',  ctrl.obtenerPorId);

// Requieren auth de asociado
router.post('/',                   verifyToken, handleUploadMultiple, ctrl.crear);
router.get('/me/mis-publicaciones', verifyToken, ctrl.misPublicaciones);
router.delete('/:id',              verifyToken, ctrl.eliminar);

// Solo admin
router.get('/admin/todas',           verifyToken, verifyAdmin, ctrl.listarAdmin);
router.patch('/:id/aprobar',         verifyToken, verifyAdmin, ctrl.aprobar);
router.patch('/:id/rechazar',        verifyToken, verifyAdmin, ctrl.rechazar);

module.exports = router;
