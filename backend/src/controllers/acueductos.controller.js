const Acueducto = require('../models/Acueducto');
const { ok, asyncHandler } = require('../utils/response');

// Lista pública mínima, usada por la app móvil para el selector de acueducto.
const listarPublico = asyncHandler(async (req, res) => {
  const acueductos = await Acueducto.find({ estado: 'ACTIVO' })
    .select('_id nombre municipio vereda logoUrl colorPrimario')
    .sort('nombre');

  return ok(res, acueductos);
});

module.exports = { listarPublico };
