const express = require('express');
const { listar, listarAdmin, subir, eliminar } = require('../controllers/documentos.controller');
const { verifyToken, verifyAdmin } = require('../middleware/auth.middleware');
const { handleUpload } = require('../middleware/upload.middleware');

const router = express.Router();

router.get('/',                      verifyToken, listar);
router.get('/asociado/:id',          verifyToken, verifyAdmin, listarAdmin);
router.post('/',                     verifyToken, handleUpload, subir);
router.delete('/:tipo',              verifyToken, eliminar);

module.exports = router;
