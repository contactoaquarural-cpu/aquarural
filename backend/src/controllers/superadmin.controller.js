const Acueducto = require('../models/Acueducto');
const Suscriptor = require('../models/Suscriptor');
const Factura = require('../models/Factura');
const { encrypt, decrypt } = require('../services/encryption.service');

/**
 * Registrar un nuevo acueducto veredal en la plataforma SaaS
 */
const crearAcueducto = async (req, res) => {
  try {
    const {
      nombre,
      nit,
      departamento,
      municipio,
      vereda,
      direccion,
      telefono,
      email,
      representanteLegal,
      colorPrimario,
      colorSecundario,
      planSaaS,
      costoMensualSaaS,
      wompiPublicKey,
      wompiPrivateKey,
      wompiEventsSecret,
      wompiIntegritySecret,
      wompiSandbox,
      tarifaBaseMensual,
    } = req.body;

    const existeNit = await Acueducto.findOne({ nit });
    if (existeNit) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Ya existe un acueducto registrado con este NIT.',
      });
    }

    const nuevoAcueducto = new Acueducto({
      nombre,
      nit,
      departamento: departamento || 'Huila',
      municipio,
      vereda,
      direccion,
      telefono,
      email,
      representanteLegal,
      colorPrimario: colorPrimario || '#0EA5E9',
      colorSecundario: colorSecundario || '#10B981',
      planSaaS: planSaaS || 'BASICO',
      costoMensualSaaS: costoMensualSaaS || 0,
      wompiPublicKey: wompiPublicKey || '',
      wompiPrivateKeyEncrypted: encrypt(wompiPrivateKey),
      wompiEventsSecretEncrypted: encrypt(wompiEventsSecret),
      wompiIntegritySecretEncrypted: encrypt(wompiIntegritySecret),
      wompiSandbox: wompiSandbox !== undefined ? wompiSandbox : true,
      tarifaBaseMensual: tarifaBaseMensual || 25000,
    });

    await nuevoAcueducto.save();

    res.status(201).json({
      ok: true,
      mensaje: 'Acueducto veredal registrado exitosamente.',
      acueducto: nuevoAcueducto,
    });
  } catch (error) {
    console.error('Error en crearAcueducto:', error);
    res.status(500).json({
      ok: false,
      mensaje: 'Error interno al registrar el acueducto.',
    });
  }
};

/**
 * Listar todos los acueductos registrados
 */
const obtenerAcueductos = async (req, res) => {
  try {
    const acueductos = await Acueducto.find().sort({ createdAt: -1 });

    res.json({
      ok: true,
      total: acueductos.length,
      acueductos,
    });
  } catch (error) {
    console.error('Error en obtenerAcueductos:', error);
    res.status(500).json({
      ok: false,
      mensaje: 'Error al obtener la lista de acueductos.',
    });
  }
};

/**
 * Obtener detalle de un acueducto
 */
const obtenerAcueductoPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const acueducto = await Acueducto.findById(id);

    if (!acueducto) {
      return res.status(444).json({
        ok: false,
        mensaje: 'Acueducto no encontrado.',
      });
    }

    const acueductoObj = acueducto.toObject();
    // Descifrar llaves para edicion en panel superadmin
    acueductoObj.wompiPrivateKey = decrypt(acueducto.wompiPrivateKeyEncrypted);
    acueductoObj.wompiEventsSecret = decrypt(acueducto.wompiEventsSecretEncrypted);
    acueductoObj.wompiIntegritySecret = decrypt(acueducto.wompiIntegritySecretEncrypted);

    res.json({
      ok: true,
      acueducto: acueductoObj,
    });
  } catch (error) {
    console.error('Error en obtenerAcueductoPorId:', error);
    res.status(500).json({
      ok: false,
      mensaje: 'Error al obtener el acueducto.',
    });
  }
};

/**
 * Actualizar acueducto
 */
const actualizarAcueducto = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    if (updateData.wompiPrivateKey) {
      updateData.wompiPrivateKeyEncrypted = encrypt(updateData.wompiPrivateKey);
      delete updateData.wompiPrivateKey;
    }
    if (updateData.wompiEventsSecret) {
      updateData.wompiEventsSecretEncrypted = encrypt(updateData.wompiEventsSecret);
      delete updateData.wompiEventsSecret;
    }
    if (updateData.wompiIntegritySecret) {
      updateData.wompiIntegritySecretEncrypted = encrypt(updateData.wompiIntegritySecret);
      delete updateData.wompiIntegritySecret;
    }

    const acueductoActualizado = await Acueducto.findByIdAndUpdate(id, updateData, { new: true });

    res.json({
      ok: true,
      mensaje: 'Acueducto actualizado correctamente.',
      acueducto: acueductoActualizado,
    });
  } catch (error) {
    console.error('Error en actualizarAcueducto:', error);
    res.status(500).json({
      ok: false,
      mensaje: 'Error al actualizar el acueducto.',
    });
  }
};

/**
 * Métricas globales para el Dashboard del SuperAdmin
 */
const obtenerMetricasGlobales = async (req, res) => {
  try {
    const totalAcueductos = await Acueducto.countDocuments();
    const acueductosActivos = await Acueducto.countDocuments({ estado: 'ACTIVO' });
    const acueductosSuspendidos = await Acueducto.countDocuments({ estado: 'SUSPENDIDO' });
    const totalSuscriptores = await Suscriptor.countDocuments();
    const totalFacturas = await Factura.countDocuments();

    const recaudoConsolidado = await Factura.aggregate([
      { $match: { estado: 'PAGADA' } },
      { $group: { _id: null, total: { $sum: '$montoTotal' } } },
    ]);

    const recaudoTotal = recaudoConsolidado.length > 0 ? recaudoConsolidado[0].total : 0;

    res.json({
      ok: true,
      metricas: {
        totalAcueductos,
        acueductosActivos,
        acueductosSuspendidos,
        totalSuscriptores,
        totalFacturas,
        recaudoTotal,
      },
    });
  } catch (error) {
    console.error('Error en obtenerMetricasGlobales:', error);
    res.status(500).json({
      ok: false,
      mensaje: 'Error al obtener métricas globales.',
    });
  }
};

module.exports = {
  crearAcueducto,
  obtenerAcueductos,
  obtenerAcueductoPorId,
  actualizarAcueducto,
  obtenerMetricasGlobales,
};
