const { z } = require('zod');
const Asociado = require('../models/Asociado');
const Aporte = require('../models/Aporte');
const Notificacion = require('../models/Notificacion');
const { enviarNotificacionMasiva } = require('../services/firebase.service');
const logger = require('../utils/logger');

const notificacionSchema = z.object({
  titulo: z.string().min(3, 'El título debe tener al menos 3 caracteres'),
  mensaje: z.string().min(5, 'El mensaje debe tener al menos 5 caracteres'),
  tipo: z.enum(['MORA', 'NOTICIA', 'CONVENIO', 'SISTEMA']).default('SISTEMA'),
  soloMorosos: z.boolean().default(false),
});

// ─── GET /admin/reportes/morosos ─────────────────────────────────────────────

exports.reporteMorosos = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const filtro = { estado: { $in: ['EN_MORA', 'INACTIVO'] } };

    const [morosos, total] = await Promise.all([
      Asociado.find(filtro)
        .select('-password')
        .skip(skip)
        .limit(limit)
        .sort({ estado: 1, createdAt: 1 }),
      Asociado.countDocuments(filtro),
    ]);

    // Enriquecer con deuda estimada (aportes PENDIENTES)
    const morososConDeuda = await Promise.all(
      morosos.map(async (asociado) => {
        const aportesPendientes = await Aporte.find({
          asociadoId: asociado._id,
          estado: 'PENDIENTE',
        }).select('mes año monto');

        const deudaTotal = aportesPendientes.reduce((sum, a) => sum + a.monto, 0);
        return {
          ...asociado.toObject(),
          aportesPendientes: aportesPendientes.length,
          deudaTotal,
        };
      })
    );

    res.status(200).json({
      success: true,
      data: morososConDeuda,
      message: 'Reporte de morosos obtenido exitosamente',
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.error('Error al generar reporte de morosos', { error: error.message });
    res.status(500).json({
      success: false,
      data: null,
      message: 'Error interno del servidor',
    });
  }
};

// ─── GET /admin/reportes/financiero ──────────────────────────────────────────

exports.reporteFinanciero = async (req, res) => {
  try {
    const añoActual = new Date().getFullYear();

    const [
      totalAsociados,
      alDia,
      enMora,
      inactivos,
      aportesAño,
      aportesTotalPagado,
    ] = await Promise.all([
      Asociado.countDocuments(),
      Asociado.countDocuments({ estado: 'AL_DIA' }),
      Asociado.countDocuments({ estado: 'EN_MORA' }),
      Asociado.countDocuments({ estado: 'INACTIVO' }),
      Aporte.find({ año: añoActual }).select('mes monto estado'),
      Aporte.aggregate([
        { $match: { estado: 'PAGADO' } },
        { $group: { _id: null, total: { $sum: '$monto' } } },
      ]),
    ]);

    // Recaudación por mes del año actual
    const recaudacionMensual = Array.from({ length: 12 }, (_, i) => {
      const mes = i + 1;
      const aportesMes = aportesAño.filter((a) => a.mes === mes);
      return {
        mes,
        pagado:   aportesMes.filter((a) => a.estado === 'PAGADO').reduce((s, a) => s + a.monto, 0),
        pendiente: aportesMes.filter((a) => a.estado === 'PENDIENTE').reduce((s, a) => s + a.monto, 0),
      };
    });

    const recaudacionTotal = aportesTotalPagado[0]?.total ?? 0;
    const indiceMorosidad = totalAsociados > 0
      ? Math.round(((enMora + inactivos) / totalAsociados) * 100)
      : 0;

    res.status(200).json({
      success: true,
      data: {
        totalAsociados,
        alDia,
        enMora,
        inactivos,
        recaudacionTotal,
        indiceMorosidad,
        recaudacionMensual,
      },
      message: 'Reporte financiero obtenido exitosamente',
    });
  } catch (error) {
    logger.error('Error al generar reporte financiero', { error: error.message });
    res.status(500).json({
      success: false,
      data: null,
      message: 'Error interno del servidor',
    });
  }
};

// ─── POST /admin/notificaciones/enviar ───────────────────────────────────────

exports.enviarNotificacionMasiva = async (req, res) => {
  try {
    const resultado = notificacionSchema.safeParse(req.body);
    if (!resultado.success) {
      return res.status(400).json({
        success: false,
        data: null,
        message: resultado.error.errors[0].message,
      });
    }

    const { titulo, mensaje, tipo, soloMorosos } = resultado.data;

    // Determinar destinatarios
    const filtro = soloMorosos
      ? { estado: { $in: ['EN_MORA', 'INACTIVO'] } }
      : {};

    const asociados = await Asociado.find(filtro).select('_id fcmToken');

    if (!asociados.length) {
      return res.status(200).json({
        success: true,
        data: { enviadas: 0 },
        message: 'No hay destinatarios para la notificación',
      });
    }

    // Guardar notificaciones en BD
    const notificaciones = asociados.map((a) => ({
      asociadoId: a._id,
      titulo,
      mensaje,
      tipo,
    }));
    await Notificacion.insertMany(notificaciones);

    // Enviar push notifications
    const tokens = asociados.map((a) => a.fcmToken).filter(Boolean);
    await enviarNotificacionMasiva(tokens, titulo, mensaje);

    logger.info('Notificación masiva enviada', {
      destinatarios: asociados.length,
      pushEnviadas: tokens.length,
      tipo,
    });

    res.status(200).json({
      success: true,
      data: { enviadas: asociados.length, pushEnviadas: tokens.length },
      message: 'Notificaciones enviadas exitosamente',
    });
  } catch (error) {
    logger.error('Error al enviar notificación masiva', { error: error.message });
    res.status(500).json({
      success: false,
      data: null,
      message: 'Error interno del servidor',
    });
  }
};
