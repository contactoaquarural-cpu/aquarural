const { z } = require('zod');
const Capitulo    = require('../models/Capitulo');
const Asociado    = require('../models/Asociado');
const { subirVideo }                      = require('../services/cloudinary.service');
const { enviarNotificacionMasiva }        = require('../services/firebase.service');
const logger = require('../utils/logger');

const crearSchema = z.object({
  numero:      z.coerce.number().int().min(1, 'El número de capítulo debe ser mayor a 0'),
  titulo:      z.string().min(3, 'El título debe tener al menos 3 caracteres').trim(),
  descripcion: z.string().trim().optional(),
  duracion:    z.coerce.number().min(0).optional(),
});

// ─── POST /capitulos (admin) ──────────────────────────────────────────────────
exports.crear = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, data: null, message: 'Debes subir un archivo de video' });
    }

    const resultado = crearSchema.safeParse(req.body);
    if (!resultado.success) {
      return res.status(400).json({ success: false, data: null, message: resultado.error.errors[0].message });
    }

    const { numero, titulo, descripcion, duracion } = resultado.data;

    // Verificar que el número de capítulo no esté repetido
    const existe = await Capitulo.findOne({ numero });
    if (existe) {
      return res.status(409).json({ success: false, data: null, message: `El capítulo ${numero} ya existe` });
    }

    const publicId = `ganadero-tv/capitulo-${numero}-${Date.now()}`;
    const { videoUrl, thumbnailUrl, duracion: duracionAuto } = await subirVideo(req.file.buffer, 'aquarural/videos', publicId);

    const capitulo = await Capitulo.create({
      numero,
      titulo,
      descripcion,
      videoUrl,
      thumbnailUrl,
      duracion: duracion || duracionAuto,
      publicado: false,
    });

    logger.info('Capítulo creado', { capituloId: capitulo._id, numero, titulo });

    res.status(201).json({
      success: true,
      data: capitulo,
      message: `Capítulo ${numero} subido correctamente. Publica cuando esté listo.`,
    });
  } catch (error) {
    logger.error('Error al crear capítulo', { error: error.message });
    res.status(500).json({ success: false, data: null, message: 'Error interno del servidor' });
  }
};

// ─── GET /capitulos (público — solo publicados) ───────────────────────────────
exports.listar = async (req, res) => {
  try {
    const capitulos = await Capitulo.find({ publicado: true }).sort({ numero: -1 });
    res.status(200).json({ success: true, data: capitulos, message: 'Capítulos obtenidos' });
  } catch (error) {
    logger.error('Error al listar capítulos', { error: error.message });
    res.status(500).json({ success: false, data: null, message: 'Error interno del servidor' });
  }
};

// ─── GET /capitulos/admin (admin — todos) ─────────────────────────────────────
exports.listarAdmin = async (req, res) => {
  try {
    const capitulos = await Capitulo.find().sort({ numero: -1 });
    res.status(200).json({ success: true, data: capitulos, message: 'Capítulos obtenidos (admin)' });
  } catch (error) {
    logger.error('Error al listar capítulos (admin)', { error: error.message });
    res.status(500).json({ success: false, data: null, message: 'Error interno del servidor' });
  }
};

// ─── GET /capitulos/:id ───────────────────────────────────────────────────────
exports.obtenerPorId = async (req, res) => {
  try {
    const capitulo = await Capitulo.findById(req.params.id);
    if (!capitulo) {
      return res.status(404).json({ success: false, data: null, message: 'Capítulo no encontrado' });
    }
    res.status(200).json({ success: true, data: capitulo, message: 'Capítulo obtenido' });
  } catch (error) {
    logger.error('Error al obtener capítulo', { error: error.message });
    res.status(500).json({ success: false, data: null, message: 'Error interno del servidor' });
  }
};

// ─── PATCH /capitulos/:id/publicar (admin) ────────────────────────────────────
exports.togglePublicar = async (req, res) => {
  try {
    const capitulo = await Capitulo.findById(req.params.id);
    if (!capitulo) {
      return res.status(404).json({ success: false, data: null, message: 'Capítulo no encontrado' });
    }

    const nuevoEstado = !capitulo.publicado;
    capitulo.publicado = nuevoEstado;
    if (nuevoEstado) capitulo.fechaPublicacion = new Date();
    await capitulo.save();

    // Notificación push masiva al publicar
    if (nuevoEstado) {
      try {
        const asociados = await Asociado.find({ fcmToken: { $exists: true, $ne: null } }).select('fcmToken');
        const tokens = asociados.map((a) => a.fcmToken).filter(Boolean);
        if (tokens.length > 0) {
          await enviarNotificacionMasiva(
            tokens,
            '📺 Nuevo capítulo en Ganadero TV',
            `Capítulo ${capitulo.numero}: "${capitulo.titulo}" ya está disponible`,
            { tipo: 'GANADERO_TV', capituloId: String(capitulo._id) }
          );
        }
        logger.info('Notificación push enviada por nuevo capítulo', { numero: capitulo.numero, tokens: tokens.length });
      } catch (pushError) {
        logger.warn('Error al enviar push de nuevo capítulo', { error: pushError.message });
      }
    }

    res.status(200).json({
      success: true,
      data: capitulo,
      message: nuevoEstado ? `Capítulo ${capitulo.numero} publicado y notificación enviada` : `Capítulo ${capitulo.numero} ocultado`,
    });
  } catch (error) {
    logger.error('Error al publicar capítulo', { error: error.message });
    res.status(500).json({ success: false, data: null, message: 'Error interno del servidor' });
  }
};

// ─── PUT /capitulos/:id (admin) ───────────────────────────────────────────────
exports.actualizar = async (req, res) => {
  try {
    const { titulo, descripcion, duracion } = req.body;
    const capitulo = await Capitulo.findByIdAndUpdate(
      req.params.id,
      { ...(titulo && { titulo }), ...(descripcion !== undefined && { descripcion }), ...(duracion && { duracion }) },
      { new: true }
    );
    if (!capitulo) {
      return res.status(404).json({ success: false, data: null, message: 'Capítulo no encontrado' });
    }
    res.status(200).json({ success: true, data: capitulo, message: 'Capítulo actualizado' });
  } catch (error) {
    logger.error('Error al actualizar capítulo', { error: error.message });
    res.status(500).json({ success: false, data: null, message: 'Error interno del servidor' });
  }
};

// ─── DELETE /capitulos/:id (admin) ───────────────────────────────────────────
exports.eliminar = async (req, res) => {
  try {
    const capitulo = await Capitulo.findByIdAndDelete(req.params.id);
    if (!capitulo) {
      return res.status(404).json({ success: false, data: null, message: 'Capítulo no encontrado' });
    }
    logger.info('Capítulo eliminado', { capituloId: req.params.id });
    res.status(200).json({ success: true, data: null, message: 'Capítulo eliminado' });
  } catch (error) {
    logger.error('Error al eliminar capítulo', { error: error.message });
    res.status(500).json({ success: false, data: null, message: 'Error interno del servidor' });
  }
};
