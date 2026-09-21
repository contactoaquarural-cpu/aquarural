const Factura = require('../models/Factura');
const Acueducto = require('../models/Acueducto');
const encryption = require('../services/encryption.service');
const { generarFacturacionMasiva, recalcularEstadoMoratorio } = require('../services/facturacion.service');
const { verificarFirmaWebhook } = require('../services/wompi.service');
const { ok, fail, asyncHandler } = require('../utils/response');

const listar = asyncHandler(async (req, res) => {
  const { periodo, estado, asociadoId, page = 1, limit = 20 } = req.query;

  const filtro = { acueductoId: req.acueductoId };
  if (periodo) filtro.periodo = periodo;
  if (estado) filtro.estado = estado;

  // Un asociado solo puede ver sus propias facturas.
  if (req.user.rol === 'ASOCIADO') {
    filtro.asociadoId = req.user._id;
  } else if (asociadoId) {
    filtro.asociadoId = asociadoId;
  }

  const pageNum = Number(page);
  const limitNum = Number(limit);

  const [facturas, total] = await Promise.all([
    Factura.find(filtro)
      .populate('asociadoId', 'nombres apellidos matricula cedula')
      .sort('-periodo')
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    Factura.countDocuments(filtro),
  ]);

  return ok(res, { facturas, total, page: pageNum, limit: limitNum });
});

const generarMasiva = asyncHandler(async (req, res) => {
  const acueducto = await Acueducto.findById(req.acueductoId);
  if (!acueducto) return fail(res, 404, 'Acueducto no encontrado.');

  const resultado = await generarFacturacionMasiva(acueducto, req.body.periodo);
  return ok(res, resultado, 'Facturación masiva procesada.');
});

const anularPeriodo = asyncHandler(async (req, res) => {
  const { periodo } = req.query;
  if (!periodo) return fail(res, 400, 'Debes indicar el periodo a anular.');

  const resultado = await Factura.updateMany(
    { acueductoId: req.acueductoId, periodo, estado: { $in: ['PENDIENTE', 'VENCIDA'] } },
    { estado: 'ANULADA' }
  );

  return ok(res, { anuladas: resultado.modifiedCount }, 'Facturas del periodo anuladas.');
});

const pagoEfectivo = asyncHandler(async (req, res) => {
  const factura = await Factura.findOne({ _id: req.params.id, acueductoId: req.acueductoId });
  if (!factura) return fail(res, 404, 'Factura no encontrada.');
  if (factura.estado === 'PAGADA') return fail(res, 409, 'La factura ya está pagada.');

  factura.estado = 'PAGADA';
  factura.metodoPago = 'EFECTIVO_OFICINA';
  factura.fechaPago = new Date();
  if (req.body.notas) factura.notas = req.body.notas;
  await factura.save();
  await recalcularEstadoMoratorio(factura.acueductoId, factura.asociadoId);

  return ok(res, factura, 'Pago registrado en efectivo.');
});

// Webhook público de Wompi para el cobro de agua. La firma se verifica con las
// llaves del ACUEDUCTO dueño de la factura (no las de plataforma) — el
// acueducto se resuelve a partir de la referencia de la transacción, nunca de
// un header/query del request.
const webhookWompi = asyncHandler(async (req, res) => {
  const evento = req.body;
  const reference = evento?.data?.transaction?.reference;
  if (!reference) return fail(res, 400, 'Evento inválido.');

  const factura = await Factura.findOne({ referenciaWompi: reference }).populate('acueductoId');
  if (!factura) return fail(res, 404, 'Factura no encontrada para esa referencia.');

  const acueducto = factura.acueductoId;
  const eventsSecret = encryption.decrypt(acueducto.wompiEventsSecretEncrypted);
  const firmaValida = verificarFirmaWebhook(evento, eventsSecret);
  if (!firmaValida) return fail(res, 401, 'Firma de webhook inválida.');

  const estadoTransaccion = evento.data.transaction.status;
  if (estadoTransaccion === 'APPROVED' && factura.estado !== 'PAGADA') {
    factura.estado = 'PAGADA';
    factura.metodoPago = 'WOMPI';
    factura.wompiTransactionId = evento.data.transaction.id;
    factura.fechaPago = new Date();
    await factura.save();
    await recalcularEstadoMoratorio(factura.acueductoId, factura.asociadoId);
  }

  return ok(res, null, 'Webhook procesado.');
});

module.exports = { listar, generarMasiva, anularPeriodo, pagoEfectivo, webhookWompi };
