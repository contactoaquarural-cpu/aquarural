const express = require('express');
const router = express.Router();

const { listarPublico } = require('../controllers/acueductos.controller');

router.get('/publico', listarPublico);

module.exports = router;
