const { z } = require('zod');
const Evento       = require('../models/Evento');
const Asociado     = require('../models/Asociado');
const Notificacion = require('../models/Notificacion');
const { enviarExpoPush } = require('../services/expo.push.service');
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

    const eventoIds = eventos.map((e) => e._id);

    // Conteo por respuesta para cada evento
    const respuestas = await Notificacion.aggregate([
      { $match: { eventoId: { $in: eventoIds }, tipo: 'EVENTO', respuesta: { $ne: null } } },
      { $group: { _id: { eventoId: '$eventoId', respuesta: '$respuesta' }, total: { $sum: 1 } } },
    ]);

    const totalAsociados = await Asociado.countDocuments({ estado: { $ne: 'INACTIVO' } });

    const respuestasMap = {};
    respuestas.forEach(({ _id, total }) => {
      const eid = _id.eventoId.toString();
      if (!respuestasMap[eid]) respuestasMap[eid] = { ASISTIRE: 0, NO_ASISTIRE: 0 };
      if (_id.respuesta) respuestasMap[eid][_id.respuesta] = total;
    });

    const data = eventos.map((e) => ({
      ...e.toObject(),
      asistiran:    respuestasMap[e._id.toString()]?.ASISTIRE    || 0,
      noAsistiran:  respuestasMap[e._id.toString()]?.NO_ASISTIRE || 0,
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

    const eventoIds = eventos.map((e) => e._id);
    const notifs = await Notificacion.find({
      asociadoId: req.user.id,
      eventoId:   { $in: eventoIds },
      tipo:       'EVENTO',
    }).select('eventoId leido respuesta');

    const notifMap = {};
    notifs.forEach((n) => { notifMap[n.eventoId.toString()] = n; });

    const data = eventos.map((e) => {
      const notif = notifMap[e._id.toString()];
      return {
        ...e.toObject(),
        respondida: !!notif?.respuesta,
        respuesta:  notif?.respuesta || null,
      };
    });

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

    // Obtener todos los asociados (no hay campo activo — se usan todos)
    const asociados = await Asociado.find({ estado: { $ne: 'INACTIVO' } }).select('_id fcmToken');
    const tokens = asociados.map((a) => a.fcmToken).filter(Boolean);

    const TIPO_LABEL = { COMITE: 'Comité', REUNION: 'Reunión', CAPACITACION: 'Capacitación', OTRO: 'Evento' };
    const pushTitulo  = `📅 ${TIPO_LABEL[evento.tipo] || 'Evento'}: ${evento.titulo}`;
    const pushMensaje = evento.lugar
      ? `${new Date(evento.fecha).toLocaleDateString('es-CO', { day: 'numeric', month: 'long' })} · ${evento.lugar}`
      : new Date(evento.fecha).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' });

    if (tokens.length > 0) {
      await enviarExpoPush(tokens, pushTitulo, pushMensaje, { tipo: 'EVENTO', eventoId: evento._id.toString() });
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

// POST /eventos/:id/confirmar — asociado responde al evento (ASISTIRE | NO_ASISTIRE)
exports.confirmar = async (req, res) => {
  try {
    const { respuesta } = req.body;
    if (!['ASISTIRE', 'NO_ASISTIRE'].includes(respuesta)) {
      return res.status(400).json({ success: false, data: null, message: 'Respuesta inválida. Use ASISTIRE o NO_ASISTIRE' });
    }

    const notif = await Notificacion.findOneAndUpdate(
      { eventoId: req.params.id, asociadoId: req.user.id, tipo: 'EVENTO' },
      { leido: true, respuesta },
      { new: true }
    );

    if (!notif) {
      return res.status(404).json({ success: false, data: null, message: 'Notificación no encontrada' });
    }

    const mensaje = respuesta === 'ASISTIRE' ? '¡Confirmado! Te esperamos.' : 'Respuesta registrada.';
    res.status(200).json({ success: true, data: notif, message: mensaje });
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
