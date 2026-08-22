const crypto = require('crypto');
const RefreshToken = require('../models/RefreshToken');
const { generarAccessToken, generarRefreshToken } = require('./jwt.utils');

const REFRESH_TTL_MS = 30 * 24 * 60 * 60 * 1000;

const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

// Emite un par access/refresh y persiste el refresh token (hasheado) en Mongo.
const emitirSesion = async (payload, { userId, userType, acueductoId = null }) => {
  const accessToken = generarAccessToken(payload);
  // jti garantiza un token distinto en cada emisión, incluso si el payload y el
  // segundo de emisión (iat) coinciden con una emisión anterior para el mismo usuario.
  const refreshToken = generarRefreshToken({ ...payload, jti: crypto.randomUUID() });

  await RefreshToken.create({
    tokenHash: hashToken(refreshToken),
    userId,
    userType,
    acueductoId,
    expiresAt: new Date(Date.now() + REFRESH_TTL_MS),
  });

  return { accessToken, refreshToken };
};

// Revoca (marca revokedAt) el refresh token dado, si existe y sigue vigente.
const revocarRefreshToken = async (refreshToken) => {
  await RefreshToken.findOneAndUpdate(
    { tokenHash: hashToken(refreshToken), revokedAt: null },
    { revokedAt: new Date() }
  );
};

// Verifica que el refresh token exista en DB y no esté revocado.
const buscarSesionActiva = async (refreshToken) =>
  RefreshToken.findOne({ tokenHash: hashToken(refreshToken), revokedAt: null });

module.exports = { emitirSesion, revocarRefreshToken, buscarSesionActiva, hashToken };
