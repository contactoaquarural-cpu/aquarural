const bcrypt = require('bcryptjs');
const { z } = require('zod');
const Asociado = require('../models/Asociado');
const Finca = require('../models/Finca');
const Aporte = require('../models/Aporte');
const Notificacion = require('../models/Notificacion');
const { subirImagen } = require('../services/cloudinary.service');
const { generarQRBase64 } = require('../services/qr.service');
const logger = require('../utils/logger');

// ─── Schemas de validación ───────────────────────────────────────────────────

const registrarSchema = z.object({
  nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  cedula: z
    .string()
    .min(5, 'La cédula debe tener al menos 5 caracteres')
    .max(10, 'La cédula no puede superar 10 caracteres'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  telefono: z.string().optional(),
  correo: z.string().email('Correo electrónico inválido').optional(),
  municipio: z.string().optional(),
});

const actualizarSchema = z.object({
  nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres').optional(),
  telefono: z.string().optional(),
  correo: z.string().email('Correo electrónico inválido').optional(),
  municipio: z.string().optional(),
  fcmToken: z.string().optional(),
});

const estadoSchema = z.object({
  estado: z.enum(['AL_DIA', 'EN_MORA', 'INACTIVO'], {
    errorMap: () => ({ message: 'Estado inválido. Usa: AL_DIA, EN_MORA o INACTIVO' }),
  }),
});

// ─── POST /asociados ─────────────────────────────────────────────────────────

exports.registrar = async (req, res) => {
  try {
    const resultado = registrarSchema.safeParse(req.body);
    if (!resultado.success) {
      return res.status(400).json({
        success: false,
        data: null,
        message: resultado.error.errors[0].message,
      });
    }

    const { nombre, cedula, password, telefono, correo, municipio } = resultado.data;

    const existente = await Asociado.findOne({ cedula });
    if (existente) {
      return res.status(409).json({
        success: false,
        data: null,
        message: 'Ya existe un asociado registrado con esa cédula',
      });
    }

    const hash = await bcrypt.hash(password, 10);
    const asociado = await Asociado.create({ nombre, cedula, password: hash, telefono, correo, municipio });

    // Crear finca si viene en el body
    if (req.body.finca) {
      const { nombre: nombreFinca, hectareas, cabezasGanado, tipoProduccion, vereda } = req.body.finca;
      const tipoValido = ['CARNE', 'LECHE', 'DOBLE'].includes(tipoProduccion) ? tipoProduccion : 'CARNE';
      await Finca.create({
        asociadoId:     asociado._id,
        nombre:         nombreFinca || 'Mi Finca',
        hectareas:      hectareas   || 0,
        cabezasGanado:  cabezasGanado || 0,
        tipoProduccion: tipoValido,
        vereda:         vereda || undefined,
      });
    }

    res.status(201).json({
      success: true,
      data: asociado.toJSON(),
      message: 'Asociado registrado exitosamente',
    });
  } catch (error) {
    logger.error('Error al registrar asociado', { error: error.message });
    res.status(500).json({
      success: false,
      data: null,
      message: 'Error interno del servidor',
    });
  }
};

// ─── GET /asociados ───────────────────────────────────────────────────────────

exports.listar = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    const filtro = {};
    if (req.query.estado) filtro.estado = req.query.estado;
    if (req.query.municipio) filtro.municipio = req.query.municipio;
    if (req.query.buscar) {
      filtro.$or = [
        { nombre: { $regex: req.query.buscar, $options: 'i' } },
        { cedula: { $regex: req.query.buscar, $options: 'i' } },
      ];
    }

    const [asociados, total] = await Promise.all([
      Asociado.find(filtro).select('-password').skip(skip).limit(limit).sort({ createdAt: -1 }),
      Asociado.countDocuments(filtro),
    ]);

    res.status(200).json({
      success: true,
      data: asociados,
      message: 'Asociados obtenidos exitosamente',
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.error('Error al listar asociados', { error: error.message });
    res.status(500).json({
      success: false,
      data: null,
      message: 'Error interno del servidor',
    });
  }
};

// ─── GET /asociados/:id ───────────────────────────────────────────────────────

exports.obtenerPorId = async (req, res) => {
  try {
    const asociado = await Asociado.findById(req.params.id).select('-password');

    if (!asociado) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Asociado no encontrado',
      });
    }

    res.status(200).json({
      success: true,
      data: asociado,
      message: 'Asociado obtenido exitosamente',
    });
  } catch (error) {
    logger.error('Error al obtener asociado', { error: error.message });
    res.status(500).json({
      success: false,
      data: null,
      message: 'Error interno del servidor',
    });
  }
};

// ─── PUT /asociados/:id ───────────────────────────────────────────────────────

exports.actualizar = async (req, res) => {
  try {
    const resultado = actualizarSchema.safeParse(req.body);
    if (!resultado.success) {
      return res.status(400).json({
        success: false,
        data: null,
        message: resultado.error.errors[0].message,
      });
    }

    const asociado = await Asociado.findByIdAndUpdate(
      req.params.id,
      resultado.data,
      { new: true, runValidators: true }
    ).select('-password');

    if (!asociado) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Asociado no encontrado',
      });
    }

    res.status(200).json({
      success: true,
      data: asociado,
      message: 'Asociado actualizado exitosamente',
    });
  } catch (error) {
    logger.error('Error al actualizar asociado', { error: error.message });
    res.status(500).json({
      success: false,
      data: null,
      message: 'Error interno del servidor',
    });
  }
};

// ─── GET /asociados/:id/aportes ───────────────────────────────────────────────

exports.historialAportes = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 12));
    const skip = (page - 1) * limit;

    const filtro = { asociadoId: req.params.id };
    if (req.query.estado) filtro.estado = req.query.estado;
    if (req.query.año) filtro.año = parseInt(req.query.año);

    const [aportes, total] = await Promise.all([
      Aporte.find(filtro).skip(skip).limit(limit).sort({ año: -1, mes: -1 }),
      Aporte.countDocuments(filtro),
    ]);

    res.status(200).json({
      success: true,
      data: aportes,
      message: 'Historial de aportes obtenido exitosamente',
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    logger.error('Error al obtener historial de aportes', { error: error.message });
    res.status(500).json({ success: false, data: null, message: 'Error interno del servidor' });
  }
};

// ─── GET /asociados/:id/notificaciones ───────────────────────────────────────

exports.historialNotificaciones = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const filtro = { asociadoId: req.params.id };
    if (req.query.leido !== undefined) filtro.leido = req.query.leido === 'true';

    const [notificaciones, total] = await Promise.all([
      Notificacion.find(filtro).skip(skip).limit(limit).sort({ createdAt: -1 }),
      Notificacion.countDocuments(filtro),
    ]);

    res.status(200).json({
      success: true,
      data: notificaciones,
      message: 'Notificaciones obtenidas exitosamente',
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    logger.error('Error al obtener notificaciones', { error: error.message });
    res.status(500).json({ success: false, data: null, message: 'Error interno del servidor' });
  }
};

// ─── PATCH /asociados/:id/notificaciones/:notifId/leer ───────────────────────

exports.marcarNotificacionLeida = async (req, res) => {
  try {
    const notif = await Notificacion.findOneAndUpdate(
      { _id: req.params.notifId, asociadoId: req.params.id },
      { leido: true },
      { new: true }
    );
    if (!notif) {
      return res.status(404).json({ success: false, data: null, message: 'Notificación no encontrada' });
    }
    res.status(200).json({ success: true, data: notif, message: 'Notificación marcada como leída' });
  } catch (error) {
    logger.error('Error al marcar notificación como leída', { error: error.message });
    res.status(500).json({ success: false, data: null, message: 'Error interno del servidor' });
  }
};

// ─── PATCH /asociados/:id/notificaciones/leer-todas ──────────────────────────

exports.marcarTodasLeidas = async (req, res) => {
  try {
    const { modifiedCount } = await Notificacion.updateMany(
      { asociadoId: req.params.id, leido: false },
      { leido: true }
    );
    res.status(200).json({ success: true, data: { marcadas: modifiedCount }, message: `${modifiedCount} notificaciones marcadas como leídas` });
  } catch (error) {
    logger.error('Error al marcar todas las notificaciones como leídas', { error: error.message });
    res.status(500).json({ success: false, data: null, message: 'Error interno del servidor' });
  }
};

// ─── POST /asociados/:id/foto ─────────────────────────────────────────────────

exports.subirFoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, data: null, message: 'No se recibió ninguna imagen' });
    }

    const asociado = await Asociado.findById(req.params.id);
    if (!asociado) {
      return res.status(404).json({ success: false, data: null, message: 'Asociado no encontrado' });
    }

    const fotoUrl = await subirImagen(
      req.file.buffer,
      'asociados/fotos',
      `asociado-${asociado._id}`
    );

    asociado.foto = fotoUrl;
    await asociado.save();

    res.status(200).json({
      success: true,
      data: { foto: fotoUrl },
      message: 'Foto de perfil actualizada exitosamente',
    });
  } catch (error) {
    logger.error('Error al subir foto del asociado', { error: error.message });
    res.status(500).json({ success: false, data: null, message: 'Error interno del servidor' });
  }
};

// ─── GET /asociados/:id/qr ────────────────────────────────────────────────────

exports.obtenerQR = async (req, res) => {
  try {
    const asociado = await Asociado.findById(req.params.id).select('-password');

    if (!asociado) {
      return res.status(404).json({ success: false, data: null, message: 'Asociado no encontrado' });
    }

    if (asociado.estado === 'INACTIVO') {
      return res.status(403).json({
        success: false,
        data: null,
        message: 'Cuenta inactiva. No se puede generar el carné QR.',
      });
    }

    const { qrBase64, expiresAt } = await generarQRBase64(asociado);

    res.status(200).json({
      success: true,
      data: { qrBase64, expiresAt },
      message: 'Carné QR generado exitosamente',
    });
  } catch (error) {
    logger.error('Error al generar QR del asociado', { error: error.message });
    res.status(500).json({ success: false, data: null, message: 'Error interno del servidor' });
  }
};

// ─── PATCH /asociados/:id/fcm-token ──────────────────────────────────────────

exports.actualizarFcmToken = async (req, res) => {
  try {
    const { fcmToken } = req.body;
    if (!fcmToken) {
      return res.status(400).json({ success: false, data: null, message: 'fcmToken requerido' });
    }
    await Asociado.findByIdAndUpdate(req.params.id, { fcmToken });
    res.status(200).json({ success: true, data: null, message: 'Token FCM actualizado' });
  } catch (error) {
    logger.error('Error al actualizar fcmToken', { error: error.message });
    res.status(500).json({ success: false, data: null, message: 'Error interno del servidor' });
  }
};

// ─── PATCH /asociados/:id/estado ─────────────────────────────────────────────

exports.cambiarEstado = async (req, res) => {
  try {
    const resultado = estadoSchema.safeParse(req.body);
    if (!resultado.success) {
      return res.status(400).json({
        success: false,
        data: null,
        message: resultado.error.errors[0].message,
      });
    }

    const asociado = await Asociado.findByIdAndUpdate(
      req.params.id,
      { estado: resultado.data.estado },
      { new: true }
    ).select('-password');

    if (!asociado) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Asociado no encontrado',
      });
    }

    res.status(200).json({
      success: true,
      data: asociado,
      message: `Estado actualizado a ${resultado.data.estado}`,
    });
  } catch (error) {
    logger.error('Error al cambiar estado de asociado', { error: error.message });
    res.status(500).json({
      success: false,
      data: null,
      message: 'Error interno del servidor',
    });
  }
};
