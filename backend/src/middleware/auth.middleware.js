const { verifyAccessToken } = require('../utils/jwt.utils');

// Verifica que el request tenga un JWT válido
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      data: null,
      message: 'Token de autenticación requerido',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      data: null,
      message: 'Token inválido o expirado',
    });
  }
};

// Verifica que el usuario autenticado sea administrador
const verifyAdmin = (req, res, next) => {
  if (!req.user || !req.user.esAdmin) {
    return res.status(403).json({
      success: false,
      data: null,
      message: 'Acceso restringido a administradores',
    });
  }
  next();
};

module.exports = { verifyToken, verifyAdmin };
