const express = require('express');
const router = express.Router();
const {
  crearAcueducto,
  obtenerAcueductos,
  obtenerAcueductoPorId,
  actualizarAcueducto,
  obtenerMetricasGlobales,
} = require('../controllers/superadmin.controller');

// Rutas de administración global de la plataforma SaaS
router.post('/acueductos', crearAcueducto);
router.get('/acueductos', obtenerAcueductos);
router.get('/acueductos/:id', obtenerAcueductoPorId);
router.put('/acueductos/:id', actualizarAcueducto);
router.get('/metricas', obtenerMetricasGlobales);

module.exports = router;
