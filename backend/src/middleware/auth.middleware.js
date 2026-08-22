const { verificarAccessToken } = require('../utils/jwt.utils');
const { fail } = require('../utils/response');

const verifyToken = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return fail(res, 401, 'No autenticado.');
  }

  const token = header.slice('Bearer '.length);
  try {
    req.user = verificarAccessToken(token);
    next();
  } catch (error) {
    return fail(res, 401, 'Token inválido o expirado.');
  }
};

const verifyAdmin = (req, res, next) => {
  const rolesAdmin = ['ADMIN_ACUEDUCTO', 'TESORERO', 'SUPERADMIN'];
  if (!req.user || !rolesAdmin.includes(req.user.rol)) {
    return fail(res, 403, 'No tienes permisos de administrador.');
  }
  next();
};

const verifySuperadmin = (req, res, next) => {
  if (!req.user || req.user.rol !== 'SUPERADMIN') {
    return fail(res, 403, 'Requiere rol de SuperAdmin.');
  }
  next();
};

module.exports = { verifyToken, verifyAdmin, verifySuperadmin };
