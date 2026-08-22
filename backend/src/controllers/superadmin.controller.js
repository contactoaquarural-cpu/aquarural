const bcrypt = require('bcryptjs');
const Acueducto = require('../models/Acueducto');
const AdminUser = require('../models/AdminUser');
const env = require('../config/env');
const encryption = require('../services/encryption.service');
const { calcularPlanPorSuscriptores, precioPorFrecuencia } = require('../config/planes-saas');
const { ok, fail, asyncHandler } = require('../utils/response');

const DIAS_PRUEBA_GRATIS = Number(env.DIAS_PRUEBA_GRATIS);

const construirCamposWompi = (body) => {
  const campos = {};
  if (body.wompiPublicKey !== undefined) campos.wompiPublicKey = body.wompiPublicKey;
  if (body.wompiPrivateKey !== undefined) campos.wompiPrivateKeyEncrypted = encryption.encrypt(body.wompiPrivateKey);
  if (body.wompiEventsSecret !== undefined) campos.wompiEventsSecretEncrypted = encryption.encrypt(body.wompiEventsSecret);
  if (body.wompiIntegritySecret !== undefined) campos.wompiIntegritySecretEncrypted = encryption.encrypt(body.wompiIntegritySecret);
  if (body.wompiSandbox !== undefined) campos.wompiSandbox = body.wompiSandbox;
  return campos;
};

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
    ...construirCamposWompi(req.body),
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
  const { wompiPrivateKey, wompiEventsSecret, wompiIntegritySecret, wompiPublicKey, wompiSandbox, ...resto } = req.body;

  const acueducto = await Acueducto.findByIdAndUpdate(
    req.params.id,
    { ...resto, ...construirCamposWompi(req.body) },
    { new: true, runValidators: true }
  );

  if (!acueducto) return fail(res, 404, 'Acueducto no encontrado.');
  return ok(res, acueducto, 'Acueducto actualizado.');
});

module.exports = { crearAcueducto, listarAcueductos, obtenerAcueducto, actualizarAcueducto };
