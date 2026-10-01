const bcrypt = require('bcryptjs');
const AdminUser = require('../models/AdminUser');
const Asociado = require('../models/Asociado');
const { verificarRefreshToken } = require('../utils/jwt.utils');
const { emitirSesion, revocarRefreshToken, buscarSesionActiva } = require('../utils/session.utils');
const { ok, fail, asyncHandler } = require('../utils/response');

const construirPayloadAdmin = (admin) => ({
  _id: admin._id.toString(),
  acueductoId: admin.rol === 'SUPERADMIN' ? null : admin.acueductoId?.toString() ?? null,
  rol: admin.rol,
  correo: admin.correo,
  esAdmin: true,
});

const login = asyncHandler(async (req, res) => {
  const { correo, password } = req.body;

  const admin = await AdminUser.findOne({ correo: correo.toLowerCase() });
  if (!admin || admin.estado !== 'ACTIVO') {
    return fail(res, 401, 'Correo o contraseña incorrectos.');
  }

  const passwordValido = await bcrypt.compare(password, admin.password);
  if (!passwordValido) {
    return fail(res, 401, 'Correo o contraseña incorrectos.');
  }

  const payload = construirPayloadAdmin(admin);
  const { accessToken, refreshToken } = await emitirSesion(payload, {
    userId: admin._id,
    userType: 'ADMIN',
    acueductoId: payload.acueductoId,
  });

  admin.ultimoAcceso = new Date();
  await admin.save();

  return ok(res, { accessToken, refreshToken, user: admin.toJSON() }, 'Sesión iniciada.');
});

const login_asociado = asyncHandler(async (req, res) => {
  const { acueductoId, cedula } = req.body;

  const asociado = await Asociado.findOne({ acueductoId, cedula: cedula.trim() });
  if (!asociado) {
    return fail(res, 404, 'No estás registrado en este acueducto. Contacta a tu administrador.');
  }

  const payload = {
    _id: asociado._id.toString(),
    acueductoId: asociado.acueductoId.toString(),
    rol: 'ASOCIADO',
    esAdmin: false,
  };

  const { accessToken, refreshToken } = await emitirSesion(payload, {
    userId: asociado._id,
    userType: 'ASOCIADO',
    acueductoId: asociado.acueductoId,
  });

  return ok(res, { accessToken, refreshToken, user: asociado }, 'Sesión iniciada.');
});

const refresh = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  let decoded;
  try {
    decoded = verificarRefreshToken(refreshToken);
  } catch {
    return fail(res, 401, 'Refresh token inválido o expirado.');
  }

  const sesion = await buscarSesionActiva(refreshToken);
  if (!sesion) {
    return fail(res, 401, 'La sesión fue cerrada o ya no es válida.');
  }

  await revocarRefreshToken(refreshToken);

  const payload = {
    _id: decoded._id,
    acueductoId: decoded.acueductoId,
    rol: decoded.rol,
    correo: decoded.correo,
    esAdmin: decoded.esAdmin,
  };

  const nuevaSesion = await emitirSesion(payload, {
    userId: sesion.userId,
    userType: sesion.userType,
    acueductoId: sesion.acueductoId,
  });

  return ok(res, nuevaSesion, 'Sesión renovada.');
});

const logout = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  if (refreshToken) {
    await revocarRefreshToken(refreshToken);
  }
  return ok(res, null, 'Sesión cerrada.');
});

const cambiarPassword = asyncHandler(async (req, res) => {
  const { passwordActual, passwordNuevo } = req.body;

  const admin = await AdminUser.findById(req.user._id);
  if (!admin) return fail(res, 404, 'Usuario no encontrado.');

  const passwordValido = await bcrypt.compare(passwordActual, admin.password);
  // 403, no 401 — mismo motivo que verificarPassword: ya está autenticado,
  // un 401 aquí dispara el logout automático del interceptor global de axios.
  if (!passwordValido) return fail(res, 403, 'La contraseña actual no es correcta.');

  admin.password = await bcrypt.hash(passwordNuevo, 10);
  await admin.save();

  return ok(res, null, 'Contraseña actualizada.');
});

// Solo verifica la contraseña del admin autenticado, sin cambiar nada — usado
// como confirmación de identidad antes de acceder a secciones sensibles
// (ej. llaves Wompi en /pagos-wompi), que no deben editarse sin querer.
const verificarPassword = asyncHandler(async (req, res) => {
  const { password } = req.body;

  const admin = await AdminUser.findById(req.user._id);
  if (!admin) return fail(res, 404, 'Usuario no encontrado.');

  const passwordValido = await bcrypt.compare(password, admin.password);
  // 403, no 401 — ya está autenticado (verifyToken ya pasó), solo falla esta
  // verificación puntual. Un 401 aquí dispara el interceptor global de axios
  // que trata CUALQUIER 401 como "sesión expirada" y fuerza logout + redirige
  // a /login, lo que hacía parecer que escribir la contraseña incorrecta
  // "sacaba" al admin de la sesión en vez de mostrar el error real.
  if (!passwordValido) return fail(res, 403, 'La contraseña no es correcta.');

  return ok(res, null, 'Contraseña verificada.');
});

module.exports = { login, login_asociado, refresh, logout, cambiarPassword, verificarPassword, construirPayloadAdmin };
