const Factura = require('../models/Factura');
const encryption = require('../services/encryption.service');
const { generarFirmaCheckout, construirUrlCheckout } = require('../services/wompi.service');
const { calcularComisionWompi } = require('../services/facturacion.service');
const { ok, fail, asyncHandler } = require('../utils/response');

// Inicia el checkout Wompi de una factura de agua, usando las llaves propias
// del acueducto (no las de plataforma) — el dinero entra directo a su cuenta.
const iniciarPago = asyncHandler(async (req, res) => {
  const { facturaId } = req.body;

  const filtroFactura = { _id: facturaId, acueductoId: req.acueductoId };
  // Un ASOCIADO solo puede pagar su propia factura — sin esto, cualquier
  // suscriptor autenticado podría iniciar el pago de la factura de otro
  // suscriptor del mismo acueducto adivinando su facturaId.
  if (req.user.rol === 'ASOCIADO') filtroFactura.asociadoId = req.user._id;

  const factura = await Factura.findOne(filtroFactura);
  if (!factura) return fail(res, 404, 'Factura no encontrada.');
  if (factura.estado === 'PAGADA') return fail(res, 409, 'La factura ya está pagada.');

  const acueducto = req.acueducto;
  if (!acueducto.wompiPublicKey) return fail(res, 400, 'Este acueducto aún no tiene configurado el cobro digital.');

  const integritySecret = encryption.decrypt(acueducto.wompiIntegritySecretEncrypted);
  const reference = `AGUA-${factura._id}-${Date.now()}`;

  // Si el acueducto activó el traslado de la comisión Wompi, se calcula y se
  // suma al monto que se cobra en el checkout — montoTotal de la factura
  // sigue siendo el valor real del agua, la comisión queda guardada aparte
  // en montoComisionWompi para que el recibo muestre siempre el desglose.
  const comisionWompi = acueducto.trasladarComisionWompiAsociados
    ? calcularComisionWompi(factura.montoTotal)
    : 0;
  const montoACobrar = factura.montoTotal + comisionWompi;
  const amountInCents = Math.round(montoACobrar * 100);

  const signature = generarFirmaCheckout(reference, amountInCents, integritySecret);
  const wompiUrl = construirUrlCheckout({
    publicKey: acueducto.wompiPublicKey,
    sandbox: acueducto.wompiSandbox,
    reference,
    amountInCents,
    signature,
  });

  factura.referenciaWompi = reference;
  factura.montoComisionWompi = comisionWompi;
  await factura.save();

  // montoFactura/montoComision/montoTotal van en la respuesta para que la app
  // muestre el desglose ANTES de abrir el checkout — sin esto el suscriptor
  // vería un monto mayor en Wompi sin saber por qué.
  return ok(
    res,
    { wompiUrl, reference, montoFactura: factura.montoTotal, montoComision: comisionWompi, montoTotal: montoACobrar },
    'Checkout de pago generado.'
  );
});

module.exports = { iniciarPago };
