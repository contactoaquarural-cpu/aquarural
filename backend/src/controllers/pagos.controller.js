const { z } = require('zod');
const Aporte = require('../models/Aporte');
const Asociado = require('../models/Asociado');
const Notificacion = require('../models/Notificacion');
const { getAcceptanceToken, generarFirmaCheckout, verificarFirmaWebhook } = require('../services/wompi.service');
const logger = require('../utils/logger');

const iniciarSchema = z.object({
  mes: z.number({ required_error: 'El mes es obligatorio' }).min(1).max(12),
  año: z.number({ required_error: 'El año es obligatorio' }).min(2020),
  monto: z.number({ required_error: 'El monto es obligatorio' }).positive('El monto debe ser positivo'),
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

    const { mes, año, monto } = resultado.data;
    const asociadoId = req.user.id;

    // Verificar que no exista ya un aporte PAGADO para ese mes/año
    const aportePagado = await Aporte.findOne({ asociadoId, mes, año, estado: 'PAGADO' });
    if (aportePagado) {
      return res.status(409).json({
        success: false,
        data: null,
        message: `El aporte de ${mes}/${año} ya fue pagado`,
      });
    }

    // Crear o reutilizar un aporte PENDIENTE existente para ese mes/año
    let aporte = await Aporte.findOne({ asociadoId, mes, año, estado: 'PENDIENTE' });

    const reference = `APORTE-${asociadoId}-${mes}-${año}-${Date.now()}`;
    const amountInCents = Math.round(monto * 100);

    if (!aporte) {
      aporte = await Aporte.create({
        asociadoId,
        mes,
        año,
        monto,
        estado: 'PENDIENTE',
        referenciaPago: reference,
      });
    } else {
      aporte.referenciaPago = reference;
      aporte.monto = monto;
      await aporte.save();
    }

    // Obtener acceptance token de Wompi
    const acceptanceToken = await getAcceptanceToken();

    // Calcular firma de integridad para el checkout widget
    const integritySignature = generarFirmaCheckout(reference, amountInCents);

    res.status(200).json({
      success: true,
      data: {
        aporteId: aporte._id,
        reference,
        amountInCents,
        currency: 'COP',
        publicKey: process.env.WOMPI_PUBLIC_KEY,
        acceptanceToken,
        signature: { integrity: integritySignature },
      },
      message: 'Pago iniciado. Completa el proceso en el checkout de Wompi.',
    });
  } catch (error) {
    logger.error('Error al iniciar pago', { error: error.message });
    res.status(500).json({
      success: false,
      data: null,
      message: 'Error interno del servidor',
    });
  }
};

// ─── POST /pagos/webhook ─────────────────────────────────────────────────────
// Endpoint público — Wompi llama aquí cuando una transacción cambia de estado

exports.webhook = async (req, res) => {
  try {
    const evento = req.body;

    // Verificar firma del webhook
    if (!verificarFirmaWebhook(evento)) {
      logger.warn('Webhook Wompi con firma inválida', { evento });
      return res.status(401).json({ success: false, data: null, message: 'Firma inválida' });
    }

    const { event, data } = evento;

    // Solo procesar transacciones aprobadas
    if (event !== 'transaction.updated' || data?.transaction?.status !== 'APPROVED') {
      return res.status(200).json({ success: true, data: null, message: 'Evento ignorado' });
    }

    const { reference, amount_in_cents, payment_method_type } = data.transaction;

    // Buscar el aporte por referencia
    const aporte = await Aporte.findOne({ referenciaPago: reference, estado: 'PENDIENTE' });
    if (!aporte) {
      logger.warn('Webhook: aporte no encontrado o ya procesado', { reference });
      return res.status(200).json({ success: true, data: null, message: 'Aporte no encontrado o ya procesado' });
    }

    // Marcar aporte como pagado
    aporte.estado = 'PAGADO';
    aporte.fechaPago = new Date();
    aporte.metodoPago = payment_method_type || 'WOMPI';
    await aporte.save();

    // Recalcular estado del asociado
    const mesesSinPagar = await contarMesesSinPagar(aporte.asociadoId);
    let nuevoEstado;
    if (mesesSinPagar === 0) nuevoEstado = 'AL_DIA';
    else if (mesesSinPagar < 3) nuevoEstado = 'EN_MORA';
    else nuevoEstado = 'INACTIVO';

    await Asociado.findByIdAndUpdate(aporte.asociadoId, { estado: nuevoEstado });

    // Registrar notificación interna
    await Notificacion.create({
      asociadoId: aporte.asociadoId,
      titulo: 'Pago confirmado',
      mensaje: `Tu aporte del mes ${aporte.mes}/${aporte.año} fue recibido exitosamente.`,
      tipo: 'SISTEMA',
    });

    logger.info('Pago confirmado por webhook', { reference, asociadoId: aporte.asociadoId });

    res.status(200).json({ success: true, data: null, message: 'Pago procesado' });
  } catch (error) {
    logger.error('Error en webhook de Wompi', { error: error.message });
    res.status(500).json({ success: false, data: null, message: 'Error interno del servidor' });
  }
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

// Cuenta cuántos de los últimos 3 meses no tienen aporte PAGADO
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
    $or: ultimos3.map(m => ({ mes: m.mes, año: m.año })),
  }).select('mes año');

  const pagadosSet = new Set(pagados.map(a => `${a.año}-${a.mes}`));

  let consecutivosSinPagar = 0;
  for (const { mes: m, año: a } of ultimos3) {
    if (!pagadosSet.has(`${a}-${m}`)) consecutivosSinPagar++;
    else break;
  }

  return consecutivosSinPagar;
}

module.exports.contarMesesSinPagar = contarMesesSinPagar;
