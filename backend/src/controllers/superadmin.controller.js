const bcrypt = require('bcryptjs');
const Acueducto = require('../models/Acueducto');
const AdminUser = require('../models/AdminUser');
const Asociado = require('../models/Asociado');
const Factura = require('../models/Factura');
const FacturaSaaS = require('../models/FacturaSaaS');
const ConfiguracionGlobal = require('../models/ConfiguracionGlobal');
const env = require('../config/env');
const cloudinaryService = require('../services/cloudinary.service');
const { generarFirmaCheckout, construirUrlCheckout, verificarFirmaWebhook } = require('../services/wompi.service');
const { calcularEstadoLicencia, calcularSiguienteCiclo, recalcularPlanEnRenovacion } = require('../services/licencia.service');
const { PLANES_SAAS, calcularPlanPorSuscriptores, precioPorFrecuencia } = require('../config/planes-saas');
const { ok, fail, asyncHandler } = require('../utils/response');

const DIAS_PRUEBA_GRATIS = Number(env.DIAS_PRUEBA_GRATIS);

const crearAcueducto = asyncHandler(async (req, res) => {
  const { adminNombre, adminCorreo, adminPassword, ...datosAcueducto } = req.body;

  const correoExistente = await AdminUser.findOne({ correo: adminCorreo.toLowerCase() });
  if (correoExistente) {
    return fail(res, 409, 'Ya existe un usuario administrador con ese correo.');
  }

  const nitExistente = await Acueducto.findOne({ nit: datosAcueducto.nit });
  if (nitExistente) {
    return fail(res, 409, 'Ya existe un acueducto registrado con ese NIT.');
  }

  const ahora = new Date();
  const fechaVencimientoGratis = new Date(ahora.getTime() + DIAS_PRUEBA_GRATIS * 24 * 60 * 60 * 1000);

  // Un acueducto nuevo arranca en 0 suscriptores -> siempre plan Manantial.
  // El plan se recalcula en cada renovación según el crecimiento real (Fase D).
  const planSaaS = calcularPlanPorSuscriptores(0);
  const frecuenciaPagoSaaS = datosAcueducto.frecuenciaPagoSaaS || 'ANUAL';

  const acueducto = await Acueducto.create({
    ...datosAcueducto,
    planSaaS,
    frecuenciaPagoSaaS,
    costoSaaSVigente: precioPorFrecuencia(planSaaS, frecuenciaPagoSaaS),
    fechaInicioLicencia: ahora,
    fechaVencimientoGratis,
    estadoPagoSaaS: 'MES_GRATIS_PRUEBA',
  });

  const admin = await AdminUser.create({
    acueductoId: acueducto._id,
    nombre: adminNombre,
    correo: adminCorreo.toLowerCase(),
    password: await bcrypt.hash(adminPassword, 10),
    rol: 'ADMIN_ACUEDUCTO',
  });

  return ok(res, { acueducto, admin: admin.toJSON() }, 'Acueducto creado.', 201);
});

const listarAcueductos = asyncHandler(async (req, res) => {
  const acueductos = await Acueducto.find().sort('-createdAt');
  return ok(res, acueductos);
});

const obtenerAcueducto = asyncHandler(async (req, res) => {
  const acueducto = await Acueducto.findById(req.params.id);
  if (!acueducto) return fail(res, 404, 'Acueducto no encontrado.');
  return ok(res, acueducto);
});

const actualizarAcueducto = asyncHandler(async (req, res) => {
  const { ...resto } = req.body;

  const acueductoActual = await Acueducto.findById(req.params.id);
  if (!acueductoActual) return fail(res, 404, 'Acueducto no encontrado.');

  // Si cambia la frecuencia de pago, el costo vigente se recalcula con el
  // plan actual (el plan en sí solo se recalcula por suscriptores en la
  // renovación, no aquí).
  const cambios = { ...resto };
  const planVigente = PLANES_SAAS[acueductoActual.planSaaS] ? acueductoActual.planSaaS : calcularPlanPorSuscriptores(0);
  if (resto.frecuenciaPagoSaaS && resto.frecuenciaPagoSaaS !== acueductoActual.frecuenciaPagoSaaS) {
    cambios.costoSaaSVigente = precioPorFrecuencia(planVigente, resto.frecuenciaPagoSaaS);
  }
  // Si el plan almacenado ya no existe en el catálogo (dato viejo/inválido),
  // se normaliza al recalcularlo por rango de suscriptores.
  if (planVigente !== acueductoActual.planSaaS) {
    cambios.planSaaS = planVigente;
    cambios.costoSaaSVigente = precioPorFrecuencia(planVigente, resto.frecuenciaPagoSaaS || acueductoActual.frecuenciaPagoSaaS);
  }

  const acueducto = await Acueducto.findByIdAndUpdate(req.params.id, cambios, {
    new: true,
    runValidators: true,
  });

  return ok(res, acueducto, 'Acueducto actualizado.');
});

const eliminarAcueducto = asyncHandler(async (req, res) => {
  const acueducto = await Acueducto.findById(req.params.id);
  if (!acueducto) return fail(res, 404, 'Acueducto no encontrado.');

  // Un acueducto con datos reales (suscriptores o facturas) nunca se borra:
  // se pierde historial de cobro y auditoría. Para ese caso existe el toggle
  // de suspender/activar acceso, que es reversible. Eliminar solo aplica a
  // registros de prueba o duplicados que nunca llegaron a operar.
  const [totalSuscriptores, totalFacturas] = await Promise.all([
    Asociado.countDocuments({ acueductoId: acueducto._id }),
    Factura.countDocuments({ acueductoId: acueducto._id }),
  ]);

  if (totalSuscriptores > 0 || totalFacturas > 0) {
    return fail(
      res,
      409,
      `No se puede eliminar: tiene ${totalSuscriptores} suscriptor(es) y ${totalFacturas} factura(s) registradas. Usa "Suspender" para bloquear su acceso sin perder el historial.`
    );
  }

  await Promise.all([
    Acueducto.findByIdAndDelete(acueducto._id),
    AdminUser.deleteMany({ acueductoId: acueducto._id }),
  ]);

  return ok(res, null, 'Acueducto eliminado.');
});

// Genera un código de factura legible, único por acueducto+periodo — mismo
// formato que configuracion.controller.js (no exportado desde ahí, se repite
// aquí a propósito para no acoplar los dos controllers entre sí).
const generarCodigoFactura = (acueducto, periodo) =>
  `SAAS-${periodo.replace('-', '')}-${acueducto._id.toString().slice(-6).toUpperCase()}`;

// Inicia el cobro Wompi de la mensualidad/anualidad SaaS que el acueducto le
// debe a MetaDevelopment (dirección opuesta al cobro de agua: aquí las llaves
// son las de PLATAFORMA, nunca las del acueducto). Crea o reutiliza la
// FacturaSaaS PENDIENTE del ciclo vigente y devuelve la URL real de checkout.
const iniciarPagoSaaS = asyncHandler(async (req, res) => {
  const { acueductoId } = req.body;
  if (!acueductoId) return fail(res, 400, 'Debes indicar el acueducto.');

  const acueducto = await Acueducto.findById(acueductoId);
  if (!acueducto) return fail(res, 404, 'Acueducto no encontrado.');

  if (!env.WOMPI_PLATAFORMA_PUBLIC_KEY || !env.WOMPI_PLATAFORMA_INTEGRITY_SECRET) {
    return fail(res, 400, 'La plataforma aún no tiene configuradas sus llaves Wompi. Usa WhatsApp o marcar como pagado mientras tanto.');
  }

  const totalSuscriptores = await Asociado.countDocuments({ acueductoId: acueducto._id });
  const { plan, costo } = recalcularPlanEnRenovacion(totalSuscriptores, acueducto.frecuenciaPagoSaaS);

  const estado = calcularEstadoLicencia(acueducto);
  const fechaBaseCiclo = estado.fechaFinCicloVigente || acueducto.fechaVencimientoGratis || new Date();
  const { inicio, fin } = calcularSiguienteCiclo(fechaBaseCiclo, acueducto.frecuenciaPagoSaaS);

  const periodo = inicio.toISOString().slice(0, 7);
  const codigoFactura = generarCodigoFactura(acueducto, periodo);

  // Referencia única de esta transacción de Wompi — nunca la del código de
  // factura solo, para poder reintentar un pago fallido sin colisionar.
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
  // Si la factura ya existía como PENDIENTE de un intento anterior, se
  // actualiza su referencia al nuevo intento (la anterior queda huérfana,
  // sin riesgo: el webhook solo confirma por la referencia más reciente).
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

  return ok(res, { wompiUrl, reference, facturaSaaSId: factura._id }, 'Checkout de licencia SaaS generado.');
});

// Webhook público de Wompi para el cobro de licencias SaaS (acueducto ->
// MetaDevelopment). Verificado con el Events Secret de PLATAFORMA, nunca el
// de un acueducto — es un flujo completamente separado del webhook de agua.
const webhookPagoSaaS = asyncHandler(async (req, res) => {
  const evento = req.body;
  const reference = evento?.data?.transaction?.reference;
  if (!reference) return fail(res, 400, 'Evento inválido.');

  const firmaValida = verificarFirmaWebhook(evento, env.WOMPI_PLATAFORMA_EVENTS_SECRET);
  if (!firmaValida) return fail(res, 401, 'Firma de webhook inválida.');

  const factura = await FacturaSaaS.findOne({ referenciaWompi: reference });
  if (!factura) return fail(res, 404, 'Factura SaaS no encontrada para esa referencia.');

  const estadoTransaccion = evento.data.transaction.status;
  if (estadoTransaccion === 'APPROVED' && factura.estado !== 'PAGADO') {
    factura.estado = 'PAGADO';
    factura.metodoPago = 'WOMPI';
    factura.fechaPago = new Date();
    await factura.save();

    const acueducto = await Acueducto.findById(factura.acueductoId);
    if (acueducto) {
      acueducto.planSaaS = factura.plan;
      acueducto.costoSaaSVigente = factura.montoTotal;
      acueducto.fechaVencimientoMembresia = factura.fechaVencimiento;
      acueducto.estadoPagoSaaS = 'AL_DIA';
      await acueducto.save();
    }
  }

  return ok(res, null, 'Webhook de pago SaaS procesado.');
});

const obtenerMetricas = asyncHandler(async (req, res) => {
  const [totalAcueductos, acueductosActivos, totalSuscriptores] = await Promise.all([
    Acueducto.countDocuments(),
    Acueducto.countDocuments({ estado: 'ACTIVO' }),
    Asociado.countDocuments(),
  ]);

  return ok(res, {
    totalAcueductos,
    acueductosActivos,
    acueductosSuspendidos: totalAcueductos - acueductosActivos,
    totalSuscriptores,
  });
});

const obtenerConfiguracionGlobal = asyncHandler(async (req, res) => {
  const config = await ConfiguracionGlobal.obtenerSingleton();
  return ok(res, config);
});

const actualizarConfiguracionGlobal = asyncHandler(async (req, res) => {
  const config = await ConfiguracionGlobal.obtenerSingleton();
  Object.assign(config, req.body);
  await config.save();
  return ok(res, config, 'Apariencia de la plataforma actualizada.');
});

const subirImagenApariencia = asyncHandler(async (req, res) => {
  if (!req.file) return fail(res, 400, 'No se recibió ningún archivo de imagen.');

  const { campo } = req.body;
  if (!['heroImagenUrl', 'loginImagenUrl'].includes(campo)) {
    return fail(res, 400, 'Campo de imagen inválido.');
  }

  const url = await cloudinaryService.subirImagenDesdeBuffer(req.file.buffer, 'apariencia');

  const config = await ConfiguracionGlobal.obtenerSingleton();
  config[campo] = url;
  await config.save();

  return ok(res, config, 'Imagen subida y guardada correctamente.');
});

module.exports = {
  crearAcueducto,
  listarAcueductos,
  obtenerAcueducto,
  actualizarAcueducto,
  eliminarAcueducto,
  obtenerMetricas,
  obtenerConfiguracionGlobal,
  actualizarConfiguracionGlobal,
  subirImagenApariencia,
  iniciarPagoSaaS,
  webhookPagoSaaS,
};
