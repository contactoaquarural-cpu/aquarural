const { z } = require('zod');
const Evento       = require('../models/Evento');
const Asociado     = require('../models/Asociado');
const Notificacion = require('../models/Notificacion');
const { enviarNotificacionMasiva } = require('../services/firebase.service');
const logger = require('../utils/logger');

const eventoSchema = z.object({
  titulo:      z.string().min(3, 'El título debe tener al menos 3 caracteres'),
  descripcion: z.string().optional().default(''),
  fecha:       z.string().refine((v) => !isNaN(Date.parse(v)), 'Fecha inválida'),
  lugar:       z.string().optional().default(''),
  tipo:        z.enum(['COMITE', 'REUNION', 'CAPACITACION', 'OTRO']).default('REUNION'),
});

// GET /eventos — lista todos los eventos (admin)
exports.listar = async (req, res) => {
  try {
    const eventos = await Evento.find().sort({ fecha: -1 });

    // Para cada evento, contar cuántos asociados confirmaron lectura
    const eventoIds = eventos.map((e) => e._id);
    const confirmados = await Notificacion.aggregate([
      { $match: { eventoId: { $in: eventoIds }, leido: true, tipo: 'EVENTO' } },
      { $group: { _id: '$eventoId', total: { $sum: 1 } } },
    ]);

    const totalAsociados = await Asociado.countDocuments({ activo: true });

    const confirmadosMap = {};
    confirmados.forEach((c) => { confirmadosMap[c._id.toString()] = c.total; });

    const data = eventos.map((e) => ({
      ...e.toObject(),
      confirmados:     confirmadosMap[e._id.toString()] || 0,
      totalAsociados,
    }));

    res.status(200).json({ success: true, data, message: 'Eventos obtenidos exitosamente' });
  } catch (error) {
    logger.error('Error al listar eventos', { error: error.message });
    res.status(500).json({ success: false, data: null, message: 'Error interno del servidor' });
  }
};

// GET /eventos/mis-eventos — eventos del asociado autenticado (app)
exports.misEventos = async (req, res) => {
  try {
    const eventos = await Evento.find().sort({ fecha: -1 });

    // Verificar cuáles ya confirmó este asociado
    const eventoIds = eventos.map((e) => e._id);
    const leidas = await Notificacion.find({
      asociadoId: req.user.id,
      eventoId:   { $in: eventoIds },
      tipo:       'EVENTO',
      leido:      true,
    }).select('eventoId');

    const leidasSet = new Set(leidas.map((n) => n.eventoId.toString()));

    const data = eventos.map((e) => ({
      ...e.toObject(),
      confirmada: leidasSet.has(e._id.toString()),
    }));

    res.status(200).json({ success: true, data, message: 'Eventos obtenidos exitosamente' });
  } catch (error) {
    logger.error('Error al obtener mis eventos', { error: error.message });
    res.status(500).json({ success: false, data: null, message: 'Error interno del servidor' });
  }
};

// POST /eventos — crear evento y enviar notificaciones (admin)
exports.crear = async (req, res) => {
  try {
    const resultado = eventoSchema.safeParse(req.body);
    if (!resultado.success) {
      return res.status(400).json({ success: false, data: null, message: resultado.error.errors[0].message });
    }

    const evento = await Evento.create({
      ...resultado.data,
      fecha:     new Date(resultado.data.fecha),
      creadoPor: req.user.id,
    });

    // Enviar notificación push a todos los asociados activos
    const asociados = await Asociado.find({ activo: true }).select('_id fcmToken');
    const tokens = asociados.map((a) => a.fcmToken).filter(Boolean);

    const TIPO_LABEL = { COMITE: 'Comité', REUNION: 'Reunión', CAPACITACION: 'Capacitación', OTRO: 'Evento' };
    const pushTitulo  = `📅 ${TIPO_LABEL[evento.tipo] || 'Evento'}: ${evento.titulo}`;
    const pushMensaje = evento.lugar
      ? `${new Date(evento.fecha).toLocaleDateString('es-CO', { day: 'numeric', month: 'long' })} · ${evento.lugar}`
      : new Date(evento.fecha).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' });

    if (tokens.length > 0) {
      await enviarNotificacionMasiva(tokens, pushTitulo, pushMensaje);
    }

    // Crear notificación persistente en BD para cada asociado (requiere confirmación)
    const notifDocs = asociados.map((a) => ({
      asociadoId:           a._id,
      titulo:               pushTitulo,
      mensaje:              pushMensaje,
      tipo:                 'EVENTO',
      eventoId:             evento._id,
      requiereConfirmacion: true,
      leido:                false,
    }));
    if (notifDocs.length > 0) await Notificacion.insertMany(notifDocs);

    await Evento.findByIdAndUpdate(evento._id, { notificacionEnviada: true });

    logger.info('Evento creado y notificaciones enviadas', { eventoId: evento._id, tokens: tokens.length });
    res.status(201).json({ success: true, data: evento, message: 'Evento creado y notificaciones enviadas' });
  } catch (error) {
    logger.error('Error al crear evento', { error: error.message });
    res.status(500).json({ success: false, data: null, message: 'Error interno del servidor' });
  }
};

// PUT /eventos/:id — actualizar evento (admin)
exports.actualizar = async (req, res) => {
  try {
    const resultado = eventoSchema.partial().safeParse(req.body);
    if (!resultado.success) {
      return res.status(400).json({ success: false, data: null, message: resultado.error.errors[0].message });
    }

    const data = { ...resultado.data };
    if (data.fecha) data.fecha = new Date(data.fecha);

    const evento = await Evento.findByIdAndUpdate(req.params.id, data, { new: true });
    if (!evento) return res.status(404).json({ success: false, data: null, message: 'Evento no encontrado' });

    res.status(200).json({ success: true, data: evento, message: 'Evento actualizado exitosamente' });
  } catch (error) {
    logger.error('Error al actualizar evento', { error: error.message });
    res.status(500).json({ success: false, data: null, message: 'Error interno del servidor' });
  }
};

// DELETE /eventos/:id — eliminar evento (admin)
exports.eliminar = async (req, res) => {
  try {
    const evento = await Evento.findByIdAndDelete(req.params.id);
    if (!evento) return res.status(404).json({ success: false, data: null, message: 'Evento no encontrado' });

    await Notificacion.deleteMany({ eventoId: req.params.id });

    res.status(200).json({ success: true, data: null, message: 'Evento eliminado exitosamente' });
  } catch (error) {
    logger.error('Error al eliminar evento', { error: error.message });
    res.status(500).json({ success: false, data: null, message: 'Error interno del servidor' });
  }
};

// POST /eventos/:id/confirmar — asociado confirma lectura del evento
exports.confirmar = async (req, res) => {
  try {
    const notif = await Notificacion.findOneAndUpdate(
      { eventoId: req.params.id, asociadoId: req.user.id, tipo: 'EVENTO' },
      { leido: true },
      { new: true }
    );

    if (!notif) {
      return res.status(404).json({ success: false, data: null, message: 'Notificación no encontrada' });
    }

    res.status(200).json({ success: true, data: notif, message: 'Lectura confirmada' });
  } catch (error) {
    logger.error('Error al confirmar evento', { error: error.message });
    res.status(500).json({ success: false, data: null, message: 'Error interno del servidor' });
  }
};

// GET /eventos/pendientes — notificaciones de eventos no confirmadas (app)
exports.pendientes = async (req, res) => {
  try {
    const notifs = await Notificacion.find({
      asociadoId:           req.user.id,
      tipo:                 'EVENTO',
      requiereConfirmacion: true,
      leido:                false,
    }).populate('eventoId');

    res.status(200).json({ success: true, data: notifs, message: 'Eventos pendientes obtenidos' });
  } catch (error) {
    logger.error('Error al obtener pendientes', { error: error.message });
    res.status(500).json({ success: false, data: null, message: 'Error interno del servidor' });
  }
};
