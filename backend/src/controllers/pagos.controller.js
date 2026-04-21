const { z } = require('zod');
const Aporte = require('../models/Aporte');
const Asociado = require('../models/Asociado');
const Notificacion = require('../models/Notificacion');
const { getAcceptanceToken, generarFirmaCheckout, verificarFirmaWebhook } = require('../services/wompi.service');
const logger = require('../utils/logger');

const iniciarSchema = z.object({
  meses: z.array(z.object({
    mes:   z.number().min(1).max(12),
    año:   z.number().min(2020),
    monto: z.number().positive(),
  })).min(1, 'Debes seleccionar al menos un mes'),
});

// ─── POST /pagos/iniciar ──────────────────────────────────────────────────────

exports.iniciar = async (req, res) => {
  try {
    const resultado = iniciarSchema.safeParse(req.body);
    if (!resultado.success) {
      return res.status(400).json({
        success: false,
        data: null,
        message: resultado.error.errors[0].message,
      });
    }

    const { meses } = resultado.data;
    const asociadoId = req.user.id;

    // Verificar que ningún mes ya esté pagado
    for (const { mes, año } of meses) {
      const pagado = await Aporte.findOne({ asociadoId, mes, año, estado: 'PAGADO' });
      if (pagado) {
        return res.status(409).json({
          success: false,
          data: null,
          message: `El aporte de ${mes}/${año} ya fue pagado`,
        });
      }
    }

    const montoTotal = meses.reduce((sum, m) => sum + m.monto, 0);
    const amountInCents = Math.round(montoTotal * 100);
    const reference = `ASOGA-${asociadoId}-${Date.now()}`;

    // Crear o actualizar un aporte PENDIENTE por cada mes
    for (const { mes, año, monto } of meses) {
      const existente = await Aporte.findOne({ asociadoId, mes, año, estado: 'PENDIENTE' });
      if (existente) {
        existente.referenciaPago = reference;
        existente.monto = monto;
        await existente.save();
      } else {
        await Aporte.create({ asociadoId, mes, año, monto, estado: 'PENDIENTE', referenciaPago: reference });
      }
    }

    const [acceptanceToken, integritySignature] = await Promise.all([
      getAcceptanceToken(),
      Promise.resolve(generarFirmaCheckout(reference, amountInCents)),
    ]);

    res.status(200).json({
      success: true,
      data: {
        reference,
        amountInCents,
        currency:        'COP',
        publicKey:       process.env.WOMPI_PUBLIC_KEY,
        acceptanceToken,
        integritySignature,
        sandbox:         process.env.WOMPI_SANDBOX === 'true',
      },
      message: 'Pago iniciado correctamente',
    });
  } catch (error) {
    logger.error('Error al iniciar pago', { error: error.message });
    res.status(500).json({ success: false, data: null, message: 'Error interno del servidor' });
  }
};

// ─── POST /pagos/webhook ──────────────────────────────────────────────────────

exports.webhook = async (req, res) => {
  try {
    const evento = req.body;

    if (!verificarFirmaWebhook(evento)) {
      logger.warn('Webhook Wompi con firma inválida');
      return res.status(401).json({ success: false, data: null, message: 'Firma inválida' });
    }

    const { event, data } = evento;

    if (event !== 'transaction.updated' || data?.transaction?.status !== 'APPROVED') {
      return res.status(200).json({ success: true, data: null, message: 'Evento ignorado' });
    }

    const { reference, payment_method_type } = data.transaction;

    // Marcar todos los aportes con esa referencia como PAGADO
    const aportes = await Aporte.find({ referenciaPago: reference, estado: 'PENDIENTE' });
    if (!aportes.length) {
      logger.warn('Webhook: aportes no encontrados o ya procesados', { reference });
      return res.status(200).json({ success: true, data: null, message: 'Aportes no encontrados o ya procesados' });
    }

    const ahora = new Date();
    for (const aporte of aportes) {
      aporte.estado     = 'PAGADO';
      aporte.fechaPago  = ahora;
      aporte.metodoPago = payment_method_type || 'WOMPI';
      await aporte.save();
    }

    // Recalcular estado del asociado
    const asociadoId = aportes[0].asociadoId;
    const mesesSinPagar = await contarMesesSinPagar(asociadoId);
    const nuevoEstado = mesesSinPagar === 0 ? 'AL_DIA' : mesesSinPagar < 3 ? 'EN_MORA' : 'INACTIVO';
    await Asociado.findByIdAndUpdate(asociadoId, { estado: nuevoEstado });

    const mesesLabel = aportes.map((a) => `${a.mes}/${a.año}`).join(', ');
    await Notificacion.create({
      asociadoId,
      titulo:  'Pago confirmado',
      mensaje: `Tu pago de los meses ${mesesLabel} fue recibido exitosamente.`,
      tipo:    'SISTEMA',
    });

    logger.info('Pago confirmado por webhook', { reference, asociadoId, meses: mesesLabel });
    res.status(200).json({ success: true, data: null, message: 'Pago procesado' });
  } catch (error) {
    logger.error('Error en webhook de Wompi', { error: error.message });
    res.status(500).json({ success: false, data: null, message: 'Error interno del servidor' });
  }
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function contarMesesSinPagar(asociadoId) {
  const hoy = new Date();
  let mes = hoy.getMonth() + 1;
  let año = hoy.getFullYear();

  const ultimos3 = [];
  for (let i = 0; i < 3; i++) {
    mes--;
    if (mes === 0) { mes = 12; año--; }
    ultimos3.push({ mes, año });
  }

  const pagados = await Aporte.find({
    asociadoId,
    estado: 'PAGADO',
    $or: ultimos3.map((m) => ({ mes: m.mes, año: m.año })),
  }).select('mes año');

  const pagadosSet = new Set(pagados.map((a) => `${a.año}-${a.mes}`));

  let consecutivos = 0;
  for (const { mes: m, año: a } of ultimos3) {
    if (!pagadosSet.has(`${a}-${m}`)) consecutivos++;
    else break;
  }
  return consecutivos;
}

module.exports.contarMesesSinPagar = contarMesesSinPagar;
