const { z } = require('zod');
const Precio        = require('../models/Precio');
const Asociado      = require('../models/Asociado');
const Notificacion  = require('../models/Notificacion');
const { enviarNotificacionMasiva } = require('../services/firebase.service');
const logger = require('../utils/logger');

const precioSchema = z.object({
  categoria: z.enum(['GANADO_CARNE', 'GANADO_LECHE', 'INSUMOS']),
  producto:  z.string().min(2, 'El nombre del producto es requerido'),
  unidad:    z.string().min(1, 'La unidad es requerida'),
  precio:    z.number().min(0, 'El precio debe ser mayor a 0'),
  activo:    z.boolean().optional(),
});

// GET /precios — lista precios activos (público)
exports.listar = async (req, res) => {
  try {
    const precios = await Precio.find({ activo: true }).sort({ categoria: 1, producto: 1 });
    res.status(200).json({ success: true, data: precios, message: 'Precios obtenidos exitosamente' });
  } catch (error) {
    logger.error('Error al listar precios', { error: error.message });
    res.status(500).json({ success: false, data: null, message: 'Error interno del servidor' });
  }
};

// POST /precios — crear precio (admin)
exports.crear = async (req, res) => {
  try {
    const resultado = precioSchema.safeParse(req.body);
    if (!resultado.success) {
      return res.status(400).json({ success: false, data: null, message: resultado.error.errors[0].message });
    }
    const precio = await Precio.create(resultado.data);
    res.status(201).json({ success: true, data: precio, message: 'Precio creado exitosamente' });
  } catch (error) {
    logger.error('Error al crear precio', { error: error.message });
    res.status(500).json({ success: false, data: null, message: 'Error interno del servidor' });
  }
};

// PUT /precios/:id — actualizar precio (admin)
exports.actualizar = async (req, res) => {
  try {
    const resultado = precioSchema.partial().safeParse(req.body);
    if (!resultado.success) {
      return res.status(400).json({ success: false, data: null, message: resultado.error.errors[0].message });
    }
    const precio = await Precio.findByIdAndUpdate(req.params.id, resultado.data, { new: true });
    if (!precio) return res.status(404).json({ success: false, data: null, message: 'Precio no encontrado' });

    try {
      const categorias = { GANADO_CARNE: 'Ganado de carne', GANADO_LECHE: 'Ganado de leche', INSUMOS: 'Insumos agropecuarios' };
      const titulo  = '💰 Actualización de precios';
      const mensaje = `Se actualizó el precio de ${precio.producto} (${categorias[precio.categoria] || precio.categoria})`;

      const [conToken, todos] = await Promise.all([
        Asociado.find({ fcmToken: { $exists: true, $ne: null } }).select('fcmToken'),
        Asociado.find({}).select('_id'),
      ]);

      const tokens = conToken.map((a) => a.fcmToken).filter(Boolean);
      if (tokens.length > 0) await enviarNotificacionMasiva(tokens, titulo, mensaje);

      const notifDocs = todos.map((a) => ({ asociadoId: a._id, titulo, mensaje, tipo: 'PRECIO' }));
      if (notifDocs.length > 0) await Notificacion.insertMany(notifDocs);

      logger.info('Notificación push enviada por actualización de precio', { producto: precio.producto, tokens: tokens.length, registros: notifDocs.length });
    } catch (pushError) {
      logger.warn('Error al enviar push de actualización de precio', { error: pushError.message });
    }

    res.status(200).json({ success: true, data: precio, message: 'Precio actualizado exitosamente' });
  } catch (error) {
    logger.error('Error al actualizar precio', { error: error.message });
    res.status(500).json({ success: false, data: null, message: 'Error interno del servidor' });
  }
};

// DELETE /precios/:id — eliminar precio (admin)
exports.eliminar = async (req, res) => {
  try {
    const precio = await Precio.findByIdAndDelete(req.params.id);
    if (!precio) return res.status(404).json({ success: false, data: null, message: 'Precio no encontrado' });
    res.status(200).json({ success: true, data: null, message: 'Precio eliminado exitosamente' });
  } catch (error) {
    logger.error('Error al eliminar precio', { error: error.message });
    res.status(500).json({ success: false, data: null, message: 'Error interno del servidor' });
  }
};
