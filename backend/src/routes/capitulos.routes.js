const router = require('express').Router();
const ctrl   = require('../controllers/capitulos.controller');
const { verifyToken, verifyAdmin } = require('../middleware/auth.middleware');
const { handleUploadVideo }        = require('../middleware/upload.middleware');

// Público — solo capítulos publicados
router.get('/',    ctrl.listar);
router.get('/:id', ctrl.obtenerPorId);

// Solo admin
router.get('/admin/todos',          verifyToken, verifyAdmin, ctrl.listarAdmin);
router.post('/',                    verifyToken, verifyAdmin, handleUploadVideo, ctrl.crear);
router.put('/:id',                  verifyToken, verifyAdmin, ctrl.actualizar);
router.patch('/:id/publicar',       verifyToken, verifyAdmin, ctrl.togglePublicar);
router.delete('/:id',               verifyToken, verifyAdmin, ctrl.eliminar);

module.exports = router;
