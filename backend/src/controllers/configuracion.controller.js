const Acueducto = require('../models/Acueducto');
const Asociado = require('../models/Asociado');
const FacturaSaaS = require('../models/FacturaSaaS');
const env = require('../config/env');
const { calcularEstadoLicencia, calcularSiguienteCiclo, recalcularPlanEnRenovacion } = require('../services/licencia.service');
const { generarFirmaCheckout, construirUrlCheckout } = require('../services/wompi.service');
const { PLANES_SAAS } = require('../config/planes-saas');
const { ok, fail, asyncHandler } = require('../utils/response');
const encryption = require('../services/encryption.service');

// Cifra las llaves Wompi del propio acueducto antes de guardarlas (mismo
// patrón que superadmin.controller.js). Solo incluye los campos presentes en
// el body, para no sobreescribir llaves ya guardadas cuando el admin deja los
// campos de contraseña en blanco (edición parcial).
const construirCamposWompi = (body) => {
  const campos = {};
  if (body.wompiPublicKey !== undefined) campos.wompiPublicKey = body.wompiPublicKey;
  if (body.wompiPrivateKey) campos.wompiPrivateKeyEncrypted = encryption.encrypt(body.wompiPrivateKey);
  if (body.wompiEventsSecret) campos.wompiEventsSecretEncrypted = encryption.encrypt(body.wompiEventsSecret);
  if (body.wompiIntegritySecret) campos.wompiIntegritySecretEncrypted = encryption.encrypt(body.wompiIntegritySecret);
  if (body.wompiSandbox !== undefined) campos.wompiSandbox = body.wompiSandbox;
  return campos;
};

// Datos operativos + de licencia del acueducto autenticado (admin del propio
// acueducto). Distinto de /superadmin/acueductos/:id, que es para el SuperAdmin.
const obtener = asyncHandler(async (req, res) => {
  const acueducto = await Acueducto.findById(req.acueductoId);
  if (!acueducto) return fail(res, 404, 'Acueducto no encontrado.');

  const estado = calcularEstadoLicencia(acueducto);

  const historialPagosSaaS = await FacturaSaaS.find({ acueductoId: req.acueductoId }).sort('-fechaEmision');

  return ok(res, {
    ...acueducto.toJSON(),
    estadoPagoSaaS: estado.estadoPagoSaaS,
    fechaInicioMembresia: estado.fechaInicioMembresia,
    fechaFinCicloVigente: estado.fechaFinCicloVigente,
    planInfo: PLANES_SAAS[acueducto.planSaaS] || null,
    historialPagosSaaS,
  });
});

const actualizar = asyncHandler(async (req, res) => {
  const { wompiPrivateKey, wompiEventsSecret, wompiIntegritySecret, ...resto } = req.body;
  const cambios = { ...resto, ...construirCamposWompi(req.body) };

  const acueducto = await Acueducto.findByIdAndUpdate(req.acueductoId, cambios, {
    new: true,
    runValidators: true,
  });
  if (!acueducto) return fail(res, 404, 'Acueducto no encontrado.');
  return ok(res, acueducto, 'Configuración actualizada.');
});

// Genera un código de factura legible, único por acueducto+periodo.
const generarCodigoFactura = (acueducto, periodo) =>
  `SAAS-${periodo.replace('-', '')}-${acueducto._id.toString().slice(-6).toUpperCase()}`;

// Confirma el pago del ciclo de licencia SaaS vigente: crea/actualiza la
// FacturaSaaS del periodo, recalcula el plan según suscriptores reales, y
// avanza fechaVencimientoMembresia al siguiente ciclo. Solo el admin del
// propio acueducto (o superadmin) puede confirmar su propio pago.
const confirmarPagoSaaS = asyncHandler(async (req, res) => {
  const acueducto = await Acueducto.findById(req.acueductoId);
  if (!acueducto) return fail(res, 404, 'Acueducto no encontrado.');

  const totalSuscriptores = await Asociado.countDocuments({ acueductoId: acueducto._id });
  const { plan, costo } = recalcularPlanEnRenovacion(totalSuscriptores, acueducto.frecuenciaPagoSaaS);

  const estado = calcularEstadoLicencia(acueducto);
  const fechaBaseCiclo = estado.fechaFinCicloVigente || acueducto.fechaVencimientoGratis || new Date();
  const { inicio, fin } = calcularSiguienteCiclo(fechaBaseCiclo, acueducto.frecuenciaPagoSaaS);

  const periodo = inicio.toISOString().slice(0, 7);
  const codigoFactura = generarCodigoFactura(acueducto, periodo);

  const factura = await FacturaSaaS.findOneAndUpdate(
    { codigoFactura },
    {
      acueductoId: acueducto._id,
      nit: acueducto.nit,
      nombreAcueducto: acueducto.nombre,
      codigoFactura,
      periodo,
      plan,
      frecuencia: acueducto.frecuenciaPagoSaaS,
      montoTotal: costo,
      fechaEmision: new Date(),
      fechaVencimiento: fin,
      estado: 'PAGADO',
      fechaPago: new Date(),
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  acueducto.planSaaS = plan;
  acueducto.costoSaaSVigente = costo;
  acueducto.fechaVencimientoMembresia = fin;
  acueducto.estadoPagoSaaS = 'AL_DIA';
  await acueducto.save();

  return ok(res, { acueducto, factura }, 'Pago de licencia SaaS confirmado.');
});

// Genera la URL de checkout de Wompi para que el ADMIN_ACUEDUCTO pague su
// propia licencia SaaS — misma lógica que superadmin.controller.js:iniciarPagoSaaS,
// pero el acueductoId se toma de req.acueductoId (tenantMiddleware, del token),
// nunca del body, para que un admin no pueda generar un cobro a nombre de otro
// acueducto. La firma de integridad se calcula aquí, en el backend, con la
// llave privada de LA PLATAFORMA (nunca las llaves Wompi propias del acueducto,
// que son para cobrar agua a sus suscriptores, no para pagarle a la plataforma)
// — así el frontend nunca necesita conocer ningún secreto para armar el pago.
const iniciarPagoSaaS = asyncHandler(async (req, res) => {
  const acueducto = await Acueducto.findById(req.acueductoId);
  if (!acueducto) return fail(res, 404, 'Acueducto no encontrado.');

  if (!env.WOMPI_PLATAFORMA_PUBLIC_KEY || !env.WOMPI_PLATAFORMA_INTEGRITY_SECRET) {
    return fail(res, 400, 'La plataforma aún no tiene configuradas sus llaves Wompi. Usa WhatsApp o marca como pagado mientras tanto.');
  }

  const totalSuscriptores = await Asociado.countDocuments({ acueductoId: acueducto._id });
  const { plan, costo } = recalcularPlanEnRenovacion(totalSuscriptores, acueducto.frecuenciaPagoSaaS);

  const estado = calcularEstadoLicencia(acueducto);
  const fechaBaseCiclo = estado.fechaFinCicloVigente || acueducto.fechaVencimientoGratis || new Date();
  const { inicio, fin } = calcularSiguienteCiclo(fechaBaseCiclo, acueducto.frecuenciaPagoSaaS);

  const periodo = inicio.toISOString().slice(0, 7);
  const codigoFactura = generarCodigoFactura(acueducto, periodo);

  const reference = `SAAS-${acueducto._id}-${Date.now()}`;
  const amountInCents = Math.round(costo * 100);

  const factura = await FacturaSaaS.findOneAndUpdate(
    { codigoFactura },
    {
      acueductoId: acueducto._id,
      nit: acueducto.nit,
      nombreAcueducto: acueducto.nombre,
      codigoFactura,
      periodo,
      plan,
      frecuencia: acueducto.frecuenciaPagoSaaS,
      montoTotal: costo,
      fechaEmision: new Date(),
      fechaVencimiento: fin,
      referenciaWompi: reference,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  if (factura.estado !== 'PAGADO') {
    factura.referenciaWompi = reference;
    await factura.save();
  }

  const signature = generarFirmaCheckout(reference, amountInCents, env.WOMPI_PLATAFORMA_INTEGRITY_SECRET);
  const wompiUrl = construirUrlCheckout({
    publicKey: env.WOMPI_PLATAFORMA_PUBLIC_KEY,
    sandbox: env.WOMPI_PLATAFORMA_SANDBOX === 'true',
    reference,
    amountInCents,
    signature,
  });

  return ok(res, { wompiUrl, factura });
});

module.exports = { obtener, actualizar, confirmarPagoSaaS, iniciarPagoSaaS };
