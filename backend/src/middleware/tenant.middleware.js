const Acueducto = require('../models/Acueducto');

/**
 * Middleware para asegurar y adjuntar la instancia del Acueducto (Multi-tenant)
 */
const tenantMiddleware = async (req, res, next) => {
  try {
    let acueductoId = req.headers['x-acueducto-id'] || req.headers['x-tenant-id'];

    if (!acueductoId && req.user && req.user.acueductoId) {
      acueductoId = req.user.acueductoId;
    }

    if (!acueductoId && req.query.acueductoId) {
      acueductoId = req.query.acueductoId;
    }

    // Para rutas del Superadmin no se exige acueducto específico
    if (req.user && req.user.rol === 'SUPERADMIN') {
      req.acueductoId = acueductoId || null;
      return next();
    }

    if (!acueductoId) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Identificador de acueducto (x-acueducto-id) no especificado.',
      });
    }

    const acueducto = await Acueducto.findById(acueductoId);
    if (!acueducto) {
      return res.status(444).json({
        ok: false,
        mensaje: 'El acueducto especificado no existe o no está registrado.',
      });
    }

    if (acueducto.estado === 'SUSPENDIDO') {
      return res.status(403).json({
        ok: false,
        mensaje: 'La cuenta de este acueducto veredal se encuentra suspendida temporalmente.',
      });
    }

    req.acueductoId = acueducto._id;
    req.acueducto = acueducto;
    next();
  } catch (error) {
    console.error('Error en tenantMiddleware:', error);
    return res.status(500).json({
      ok: false,
      mensaje: 'Error procesando la identificación del acueducto.',
    });
  }
};

module.exports = tenantMiddleware;
