const bcrypt = require('bcryptjs');
const { z } = require('zod');
const Suscriptor = require('../models/Suscriptor');
const Asociado = require('../models/Asociado');
const {
  generateAccessToken,
  generateRefreshToken,
  generateResetToken,
  verifyRefreshToken,
  verifyResetToken,
} = require('../utils/jwt.utils');
const { sendPasswordResetEmail } = require('../services/email.service');
const logger = require('../utils/logger');

// Almacenamiento en memoria de refresh tokens activos (suficiente para MVP)
const refreshTokens = new Set();

// ─── Schemas de validación ───────────────────────────────────────────────────

const loginSchema = z.object({
  cedula: z.string().min(1, 'La cédula es obligatoria'),
  password: z.string().min(1, 'La contraseña es obligatoria'),
});

const recuperarSchema = z.object({
  correo: z.string().email('Correo electrónico inválido'),
});

const cambiarPasswordSchema = z.object({
  passwordActual: z.string().min(1, 'La contraseña actual es obligatoria'),
  passwordNuevo: z.string().min(6, 'La nueva contraseña debe tener al menos 6 caracteres'),
});

// ─── POST /auth/login ────────────────────────────────────────────────────────

exports.login = async (req, res) => {
  try {
    const { cedula, email, correo, password } = req.body;
    const identifier = (cedula || email || correo || '').trim();
    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'El usuario/correo y la contraseña son obligatorios.',
      });
    }

    // Buscar en Suscriptor (AquaRural) o Asociado (fallback)
    let asociado = await Suscriptor.findOne({
      $or: [
        { cedula: identifier },
        { correo: identifier.toLowerCase() },
        { email: identifier.toLowerCase() },
      ],
    });

    if (!asociado) {
      asociado = await Asociado.findOne({
        $or: [
          { cedula: identifier },
          { correo: identifier.toLowerCase() },
        ],
      });
    }

    if (!asociado) {
      return res.status(401).json({
        success: false,
        data: null,
        message: 'Usuario/Correo o contraseña incorrectos.',
      });
    }

    if (asociado.estado === 'INACTIVO') {
      return res.status(403).json({
        success: false,
        data: null,
        message: 'Cuenta inactiva. Contacta con la asociación.',
      });
    }

    const passwordValida = await bcrypt.compare(password, asociado.password);
    if (!passwordValida) {
      return res.status(401).json({
        success: false,
        data: null,
        message: 'Cédula o contraseña incorrectos',
      });
    }

    const payload = {
      id: asociado._id,
      cedula: asociado.cedula,
      nombre: asociado.nombre,
      estado: asociado.estado,
      esAdmin: asociado.esAdmin || false,
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);
    refreshTokens.add(refreshToken);

    // Registrar último acceso sin esperar (fire and forget)
    Asociado.findByIdAndUpdate(asociado._id, { ultimoAcceso: new Date() }).catch(() => {});

    res.status(200).json({
      success: true,
      data: {
        accessToken,
        refreshToken,
        asociado: asociado.toJSON(),
      },
      message: 'Login exitoso',
    });
  } catch (error) {
    logger.error('Error en login', { error: error.message });
    res.status(500).json({
      success: false,
      data: null,
      message: 'Error interno del servidor',
    });
  }
};

// ─── POST /auth/refresh ──────────────────────────────────────────────────────

exports.refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Refresh token requerido',
      });
    }

    if (!refreshTokens.has(refreshToken)) {
      return res.status(401).json({
        success: false,
        data: null,
        message: 'Refresh token inválido',
      });
    }

    const decoded = verifyRefreshToken(refreshToken);
    const asociado = await Asociado.findById(decoded.id);

    if (!asociado || asociado.estado === 'INACTIVO') {
      refreshTokens.delete(refreshToken);
      return res.status(401).json({
        success: false,
        data: null,
        message: 'Usuario no válido',
      });
    }

    // Rotar el refresh token (invalidar el anterior, emitir uno nuevo)
    refreshTokens.delete(refreshToken);

    const payload = {
      id: asociado._id,
      cedula: asociado.cedula,
      nombre: asociado.nombre,
      estado: asociado.estado,
      esAdmin: asociado.esAdmin || false,
    };

    const newAccessToken = generateAccessToken(payload);
    const newRefreshToken = generateRefreshToken(payload);
    refreshTokens.add(newRefreshToken);

    res.status(200).json({
      success: true,
      data: { accessToken: newAccessToken, refreshToken: newRefreshToken },
      message: 'Token renovado exitosamente',
    });
  } catch (error) {
    logger.error('Error al renovar token', { error: error.message });
    res.status(401).json({
      success: false,
      data: null,
      message: 'Refresh token inválido o expirado',
    });
  }
};

// ─── POST /auth/logout ───────────────────────────────────────────────────────

exports.logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      refreshTokens.delete(refreshToken);
    }

    res.status(200).json({
      success: true,
      data: null,
      message: 'Sesión cerrada exitosamente',
    });
  } catch (error) {
    logger.error('Error en logout', { error: error.message });
    res.status(500).json({
      success: false,
      data: null,
      message: 'Error interno del servidor',
    });
  }
};

// ─── POST /auth/recuperar ────────────────────────────────────────────────────

exports.recuperar = async (req, res) => {
  try {
    const resultado = recuperarSchema.safeParse(req.body);
    if (!resultado.success) {
      return res.status(400).json({
        success: false,
        data: null,
        message: resultado.error.errors[0].message,
      });
    }

    const { correo } = resultado.data;
    const asociado = await Asociado.findOne({ correo });

    // Respuesta genérica para no revelar si el correo existe (seguridad)
    const mensajeGenerico = 'Si el correo está registrado, recibirás un enlace de recuperación';

    if (!asociado) {
      return res.status(200).json({ success: true, data: null, message: mensajeGenerico });
    }

    const resetToken = generateResetToken({ id: asociado._id, tipo: 'reset' });
    await sendPasswordResetEmail(asociado.correo, asociado.nombre, resetToken);

    res.status(200).json({ success: true, data: null, message: mensajeGenerico });
  } catch (error) {
    logger.error('Error al recuperar contraseña', { error: error.message });
    res.status(500).json({
      success: false,
      data: null,
      message: 'Error interno del servidor',
    });
  }
};

// ─── GET /auth/reset/:token ──────────────────────────────────────────────────

exports.validarReset = async (req, res) => {
  try {
    const decoded = verifyResetToken(req.params.token);

    if (decoded.tipo !== 'reset') {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Token inválido',
      });
    }

    res.status(200).json({
      success: true,
      data: { valido: true },
      message: 'Token válido',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      data: null,
      message: 'Token inválido o expirado',
    });
  }
};

// ─── POST /auth/reset/:token ─────────────────────────────────────────────────

exports.resetPassword = async (req, res) => {
  try {
    const decoded = verifyResetToken(req.params.token);

    if (decoded.tipo !== 'reset') {
      return res.status(400).json({ success: false, data: null, message: 'Token inválido' });
    }

    const { passwordNuevo } = req.body;
    if (!passwordNuevo || passwordNuevo.length < 6) {
      return res.status(400).json({ success: false, data: null, message: 'La contraseña debe tener al menos 6 caracteres' });
    }

    const hash = await bcrypt.hash(passwordNuevo, 10);
    await Asociado.findByIdAndUpdate(decoded.id, { password: hash });

    res.status(200).json({ success: true, data: null, message: 'Contraseña actualizada exitosamente' });
  } catch (error) {
    res.status(400).json({ success: false, data: null, message: 'Token inválido o expirado' });
  }
};

// ─── PUT /auth/cambiar-password ──────────────────────────────────────────────

exports.cambiarPassword = async (req, res) => {
  try {
    const resultado = cambiarPasswordSchema.safeParse(req.body);
    if (!resultado.success) {
      return res.status(400).json({
        success: false,
        data: null,
        message: resultado.error.errors[0].message,
      });
    }

    const { passwordActual, passwordNuevo } = resultado.data;
    const asociado = await Asociado.findById(req.user.id);

    if (!asociado) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Asociado no encontrado',
      });
    }

    const passwordValida = await bcrypt.compare(passwordActual, asociado.password);
    if (!passwordValida) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'La contraseña actual es incorrecta',
      });
    }

    const hash = await bcrypt.hash(passwordNuevo, 10);
    await Asociado.findByIdAndUpdate(asociado._id, { password: hash });

    res.status(200).json({
      success: true,
      data: null,
      message: 'Contraseña actualizada exitosamente',
    });
  } catch (error) {
    logger.error('Error al cambiar contraseña', { error: error.message });
    res.status(500).json({
      success: false,
      data: null,
      message: 'Error interno del servidor',
    });
  }
};
