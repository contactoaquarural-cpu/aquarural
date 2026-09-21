const Factura = require('../models/Factura');
const encryption = require('../services/encryption.service');
const { generarFirmaCheckout, construirUrlCheckout } = require('../services/wompi.service');
const { ok, fail, asyncHandler } = require('../utils/response');

// Inicia el checkout Wompi de una factura de agua, usando las llaves propias
// del acueducto (no las de plataforma) — el dinero entra directo a su cuenta.
const iniciarPago = asyncHandler(async (req, res) => {
  const { facturaId } = req.body;

  const factura = await Factura.findOne({ _id: facturaId, acueductoId: req.acueductoId });
  if (!factura) return fail(res, 404, 'Factura no encontrada.');
  if (factura.estado === 'PAGADA') return fail(res, 409, 'La factura ya está pagada.');

  const acueducto = req.acueducto;
  if (!acueducto.wompiPublicKey) return fail(res, 400, 'Este acueducto aún no tiene configurado el cobro digital.');

  const integritySecret = encryption.decrypt(acueducto.wompiIntegritySecretEncrypted);
  const reference = `AGUA-${factura._id}-${Date.now()}`;
  const amountInCents = Math.round(factura.montoTotal * 100);

  const signature = generarFirmaCheckout(reference, amountInCents, integritySecret);
  const wompiUrl = construirUrlCheckout({
    publicKey: acueducto.wompiPublicKey,
    sandbox: acueducto.wompiSandbox,
    reference,
    amountInCents,
    signature,
  });

  factura.referenciaWompi = reference;
  await factura.save();

  return ok(res, { wompiUrl, reference }, 'Checkout de pago generado.');
});

module.exports = { iniciarPago };
