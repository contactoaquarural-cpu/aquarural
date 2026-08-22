const Acueducto = require('../models/Acueducto');
const { fail } = require('../utils/response');

// Debe montarse SIEMPRE después de verifyToken.
const tenantMiddleware = (req, res, next) => {
  if (!req.user) return fail(res, 401, 'No autenticado.');

  if (req.user.rol === 'SUPERADMIN') {
    // Único rol exento del scoping: puede operar cross-tenant, o pasar un
    // acueducto explícito para consultas puntuales (nunca para roles normales).
    req.acueductoId = req.headers['x-acueducto-id'] || req.query.acueductoId || null;
    return next();
  }

  // Para cualquier otro rol el tenant sale EXCLUSIVAMENTE del JWT ya verificado.
  // Nunca confiar en un header/query aquí: eso fue la causa exacta del bug de
  // fuga de datos entre acueductos en el backend anterior.
  if (!req.user.acueductoId) {
    return fail(res, 403, 'El usuario no tiene un acueducto asociado.');
  }

  req.acueductoId = req.user.acueductoId;
  next();
};

// Carga el documento del acueducto en req.acueducto, para rutas que necesitan
// datos como tarifas o llaves Wompi. Debe montarse después de tenantMiddleware.
const attachAcueducto = async (req, res, next) => {
  if (!req.acueductoId) return next();

  const acueducto = await Acueducto.findById(req.acueductoId);
  if (!acueducto) return fail(res, 404, 'Acueducto no encontrado.');

  if (acueducto.estado === 'SUSPENDIDO' && req.user.rol !== 'SUPERADMIN') {
    return fail(res, 403, 'Esta cuenta se encuentra suspendida.');
  }

  req.acueducto = acueducto;
  next();
};

module.exports = { tenantMiddleware, attachAcueducto };
