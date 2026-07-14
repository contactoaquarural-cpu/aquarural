const { z } = require('zod');
const Publicacion   = require('../models/Publicacion');
const Asociado      = require('../models/Asociado');
const Notificacion  = require('../models/Notificacion');
const { subirImagenMercado, eliminarImagen } = require('../services/cloudinary.service');
const { enviarNotificacion } = require('../services/firebase.service');
const logger = require('../utils/logger');

const crearSchema = z.object({
  titulo:       z.string().min(5, 'El título debe tener al menos 5 caracteres').trim(),
  descripcion:  z.string().min(10, 'La descripción debe tener al menos 10 caracteres').trim(),
  categoria:    z.enum(['ANIMAL', 'TERRENO', 'FINCA', 'INSUMO', 'OTRO']),
  subcategoria: z.string().trim().optional(),
  precio:       z.coerce.number().min(0).optional(),
  negociable:   z.coerce.boolean().optional(),
  municipio:    z.string().trim().optional(),
  vereda:       z.string().trim().optional(),
  telefono:     z.string().trim().optional(),
  whatsapp:     z.string().trim().optional(),
});

// ─── POST /publicaciones ──────────────────────────────────────────────────────
exports.crear = async (req, res) => {
  try {
    // Solo asociados AL_DIA pueden publicar
    const asociado = await Asociado.findById(req.user.id).select('estado nombre');
    if (!asociado) {
      return res.status(404).json({ success: false, data: null, message: 'Asociado no encontrado' });
    }
    if (asociado.estado !== 'AL_DIA') {
      return res.status(403).json({
        success: false,
        data: null,
        message: 'Solo los asociados al día pueden publicar en el mercado',
      });
    }

    const resultado = crearSchema.safeParse(req.body);
    if (!resultado.success) {
      return res.status(400).json({
        success: false,
        data: null,
        message: resultado.error.errors[0].message,
      });
    }

    const { titulo, descripcion, categoria, subcategoria, precio, negociable, municipio, vereda, telefono, whatsapp } = resultado.data;

    // Subir fotos a Cloudinary (si se enviaron)
    const urlsFotos = [];
    if (req.files && req.files.length > 0) {
      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];
        const publicId = `mercado/${req.user.id}_${Date.now()}_${i}`;
        const url = await subirImagenMercado(file.buffer, 'asogacentro/mercado', publicId);
        urlsFotos.push(url);
      }
    }

    const publicacion = await Publicacion.create({
      asociadoId: req.user.id,
      titulo,
      descripcion,
      categoria,
      subcategoria,
      precio,
      negociable: negociable ?? false,
      fotos: urlsFotos,
      municipio: municipio || 'Garzón',
      vereda,
      contacto: { telefono, whatsapp },
      estado: 'PENDIENTE',
    });

    logger.info('Nueva publicación creada', { publicacionId: publicacion._id, asociadoId: req.user.id });

    res.status(201).json({
      success: true,
      data: publicacion,
      message: 'Publicación enviada. Será revisada por el administrador antes de aparecer en el mercado.',
    });
  } catch (error) {
    logger.error('Error al crear publicación', { error: error.message });
    res.status(500).json({ success: false, data: null, message: 'Error interno del servidor' });
  }
};

// ─── GET /publicaciones ───────────────────────────────────────────────────────
exports.listar = async (req, res) => {
  try {
    const { categoria, page = 1, limit = 12 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const filtro = { estado: 'APROBADO', activo: true };
    if (categoria && categoria !== 'TODOS') filtro.categoria = categoria;

    const [publicaciones, total] = await Promise.all([
      Publicacion.find(filtro)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .populate('asociadoId', 'nombre municipio foto'),
      Publicacion.countDocuments(filtro),
    ]);

    res.status(200).json({
      success: true,
      data: publicaciones,
      message: 'Publicaciones obtenidas',
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    logger.error('Error al listar publicaciones', { error: error.message });
    res.status(500).json({ success: false, data: null, message: 'Error interno del servidor' });
  }
};

// ─── GET /publicaciones/mis-publicaciones ─────────────────────────────────────
exports.misPublicaciones = async (req, res) => {
  try {
    const publicaciones = await Publicacion.find({ asociadoId: req.user.id })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: publicaciones,
      message: 'Mis publicaciones obtenidas',
    });
  } catch (error) {
    logger.error('Error al obtener mis publicaciones', { error: error.message });
    res.status(500).json({ success: false, data: null, message: 'Error interno del servidor' });
  }
};

// ─── GET /publicaciones/admin ─────────────────────────────────────────────────
exports.listarAdmin = async (req, res) => {
  try {
    const { estado = 'PENDIENTE', page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const filtro = {};
    if (estado !== 'TODOS') filtro.estado = estado;

    const [publicaciones, total] = await Promise.all([
      Publicacion.find(filtro)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .populate('asociadoId', 'nombre cedula telefono foto'),
      Publicacion.countDocuments(filtro),
    ]);

    res.status(200).json({
      success: true,
      data: publicaciones,
      message: 'Publicaciones para admin obtenidas',
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    logger.error('Error al listar publicaciones (admin)', { error: error.message });
    res.status(500).json({ success: false, data: null, message: 'Error interno del servidor' });
  }
};

// ─── GET /publicaciones/:id ───────────────────────────────────────────────────
exports.obtenerPorId = async (req, res) => {
  try {
    const publicacion = await Publicacion.findById(req.params.id)
      .populate('asociadoId', 'nombre municipio foto');

    if (!publicacion) {
      return res.status(404).json({ success: false, data: null, message: 'Publicación no encontrada' });
    }

    res.status(200).json({ success: true, data: publicacion, message: 'Publicación obtenida' });
  } catch (error) {
    logger.error('Error al obtener publicación', { error: error.message });
    res.status(500).json({ success: false, data: null, message: 'Error interno del servidor' });
  }
};

// ─── DELETE /publicaciones/:id ────────────────────────────────────────────────
exports.eliminar = async (req, res) => {
  try {
    const publicacion = await Publicacion.findById(req.params.id);
    if (!publicacion) {
      return res.status(404).json({ success: false, data: null, message: 'Publicación no encontrada' });
    }

    // Solo el dueño o el admin pueden eliminar
    const esAdmin = req.user.rol === 'admin';
    const esDueno = publicacion.asociadoId.toString() === req.user.id;
    if (!esAdmin && !esDueno) {
      return res.status(403).json({ success: false, data: null, message: 'No tienes permiso para eliminar esta publicación' });
    }

    await Publicacion.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, data: null, message: 'Publicación eliminada' });
  } catch (error) {
    logger.error('Error al eliminar publicación', { error: error.message });
    res.status(500).json({ success: false, data: null, message: 'Error interno del servidor' });
  }
};

// ─── PATCH /publicaciones/:id/aprobar (admin) ─────────────────────────────────
exports.aprobar = async (req, res) => {
  try {
    const publicacion = await Publicacion.findByIdAndUpdate(
      req.params.id,
      { estado: 'APROBADO', motivoRechazo: null },
      { new: true }
    );

    if (!publicacion) {
      return res.status(404).json({ success: false, data: null, message: 'Publicación no encontrada' });
    }

    try {
      const asociado = await Asociado.findById(publicacion.asociadoId).select('_id fcmToken');
      if (asociado) {
        const titulo  = '✅ Publicación aprobada';
        const mensaje = `Tu publicación "${publicacion.titulo}" ya está visible en el Mercado Ganadero`;
        await Notificacion.create({ asociadoId: asociado._id, titulo, mensaje, tipo: 'MERCADO' });
        if (asociado.fcmToken) await enviarNotificacion(asociado.fcmToken, titulo, mensaje);
        logger.info('Notificación de aprobación enviada', { publicacionId: publicacion._id, asociadoId: asociado._id });
      }
    } catch (pushError) {
      logger.warn('Error al enviar notificación de aprobación', { error: pushError.message });
    }

    res.status(200).json({ success: true, data: publicacion, message: 'Publicación aprobada y visible en el mercado' });
  } catch (error) {
    logger.error('Error al aprobar publicación', { error: error.message });
    res.status(500).json({ success: false, data: null, message: 'Error interno del servidor' });
  }
};

// ─── PATCH /publicaciones/:id/rechazar (admin) ────────────────────────────────
exports.rechazar = async (req, res) => {
  try {
    const { motivo } = req.body;
    if (!motivo || !motivo.trim()) {
      return res.status(400).json({ success: false, data: null, message: 'Debes indicar el motivo del rechazo' });
    }

    const publicacion = await Publicacion.findByIdAndUpdate(
      req.params.id,
      { estado: 'RECHAZADO', motivoRechazo: motivo.trim() },
      { new: true }
    );

    if (!publicacion) {
      return res.status(404).json({ success: false, data: null, message: 'Publicación no encontrada' });
    }

    try {
      const asociado = await Asociado.findById(publicacion.asociadoId).select('_id fcmToken');
      if (asociado) {
        const titulo  = '❌ Publicación rechazada';
        const mensaje = `Tu publicación "${publicacion.titulo}" fue rechazada. Motivo: ${motivo.trim()}`;
        await Notificacion.create({ asociadoId: asociado._id, titulo, mensaje, tipo: 'MERCADO' });
        if (asociado.fcmToken) await enviarNotificacion(asociado.fcmToken, titulo, mensaje);
        logger.info('Notificación de rechazo enviada', { publicacionId: publicacion._id, asociadoId: asociado._id });
      }
    } catch (pushError) {
      logger.warn('Error al enviar notificación de rechazo', { error: pushError.message });
    }

    res.status(200).json({ success: true, data: publicacion, message: 'Publicación rechazada' });
  } catch (error) {
    logger.error('Error al rechazar publicación', { error: error.message });
    res.status(500).json({ success: false, data: null, message: 'Error interno del servidor' });
  }
};
