const jwt = require('jsonwebtoken');
const env = require('../config/env');

const ACCESS_TOKEN_TTL = '15m';
const REFRESH_TOKEN_TTL = '30d';

const generarAccessToken = (payload) =>
  jwt.sign(payload, env.JWT_SECRET, { expiresIn: ACCESS_TOKEN_TTL });

const generarRefreshToken = (payload) =>
  jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_TTL });

const verificarAccessToken = (token) => jwt.verify(token, env.JWT_SECRET);

const verificarRefreshToken = (token) => jwt.verify(token, env.JWT_REFRESH_SECRET);

module.exports = {
  generarAccessToken,
  generarRefreshToken,
  verificarAccessToken,
  verificarRefreshToken,
  REFRESH_TOKEN_TTL,
};
