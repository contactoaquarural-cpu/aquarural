const crypto = require('crypto');
const Factura = require('../models/Factura');
const Suscriptor = require('../models/Suscriptor');
const Acueducto = require('../models/Acueducto');
const { decrypt } = require('../services/encryption.service');

/**
 * Generar la facturación masiva del periodo en 1-clic
 */
const generarFacturacionMasiva = async (req, res) => {
  try {
    const acueductoId = req.acueductoId;
    const acueducto = req.acueducto;
    const { periodo, diasParaVencer = 15 } = req.body;

    if (!periodo || !/^\d{4}-\d{2}$/.test(periodo)) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Formato de periodo inválido. Debe ser YYYY-MM (ej. 2026-08).',
      });
    }

    const suscriptores = await Suscriptor.find({
      acueductoId,
      estadoServicio: 'ACTIVO',
    });

    if (suscriptores.length === 0) {
      return res.status(400).json({
        ok: false,
        mensaje: 'No hay suscriptores activos para facturar en este acueducto.',
      });
    }

    const fechaVencimiento = new Date();
    fechaVencimiento.setDate(fechaVencimiento.getDate() + parseInt(diasParaVencer));

    const facturasACrear = [];
    const omitidos = [];

    for (const s of suscriptores) {
      const existe = await Factura.findOne({
        acueductoId,
        suscriptorId: s._id,
        periodo,
      });

      if (existe) {
        omitidos.push(s.matricula);
        continue;
      }

      const montoCargoFijo = s.tarifaPersonalizada || acueducto.tarifaBaseMensual || 25000;
      const codigoFactura = `FAC-${periodo.replace('-', '')}-${s.matricula}`;

      facturasACrear.push({
        acueductoId,
        suscriptorId: s._id,
        codigoFactura,
        periodo,
        montoCargoFijo,
        montoConsumo: 0,
        montoMora: s.estadoMoratorio === 'EN_MORA' ? 5000 : 0,
        montoTotal: montoCargoFijo + (s.estadoMoratorio === 'EN_MORA' ? 5000 : 0),
        fechaVencimiento,
        estado: 'PENDIENTE',
      });
    }

    if (facturasACrear.length > 0) {
      await Factura.insertMany(facturasACrear);
    }

    res.json({
      ok: true,
      mensaje: `Facturación del periodo ${periodo} generada exitosamente.`,
      totalGeneradas: facturasACrear.length,
      totalOmitidas: omitidos.length,
    });
  } catch (error) {
    console.error('Error en generarFacturacionMasiva:', error);
    res.status(500).json({
      ok: false,
      mensaje: 'Error interno al generar facturación masiva.',
    });
  }
};

/**
 * Consultar facturas por cédula o matrícula (para el suscriptor / app)
 */
const consultarDeudaSuscriptor = async (req, res) => {
  try {
    const acueductoId = req.acueductoId;
    const { identificacion } = req.query; // Cédula o Matrícula

    if (!identificacion) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Debe proporcionar la cédula o matrícula del suscriptor.',
      });
    }

    const suscriptor = await Suscriptor.findOne({
      acueductoId,
      $or: [{ cedula: identificacion.trim() }, { matricula: identificacion.trim() }],
    });

    if (!suscriptor) {
      return res.status(444).json({
        ok: false,
        mensaje: 'Suscriptor no encontrado en este acueducto.',
      });
    }

    const facturasPendientes = await Factura.find({
      acueductoId,
      suscriptorId: suscriptor._id,
      estado: { $in: ['PENDIENTE', 'VENCIDA'] },
    }).sort({ periodo: -1 });

    const totalDeuda = facturasPendientes.reduce((acc, f) => acc + f.montoTotal, 0);

    res.json({
      ok: true,
      suscriptor: {
        id: suscriptor._id,
        nombres: suscriptor.nombres,
        apellidos: suscriptor.apellidos,
        cedula: suscriptor.cedula,
        matricula: suscriptor.matricula,
        vereda: suscriptor.vereda,
        numeroMedidor: suscriptor.numeroMedidor,
        estadoMoratorio: suscriptor.estadoMoratorio,
        latitud: suscriptor.latitud,
        longitud: suscriptor.longitud,
      },
      totalDeuda,
      facturasPendientes,
    });
  } catch (error) {
    console.error('Error en consultarDeudaSuscriptor:', error);
    res.status(500).json({
      ok: false,
      mensaje: 'Error al consultar la deuda del suscriptor.',
    });
  }
};

/**
 * Generar la firma de integridad Wompi HMAC-SHA256 para pago seguro
 */
const iniciarPagoWompi = async (req, res) => {
  try {
    const { facturaId } = req.body;
    const factura = await Factura.findById(facturaId).populate('acueductoId suscriptorId');

    if (!factura) {
      return res.status(444).json({ ok: false, mensaje: 'Factura no encontrada.' });
    }

    const acueducto = factura.acueductoId;
    const integritySecret = decrypt(acueducto.wompiIntegritySecretEncrypted);

    if (!acueducto.wompiPublicKey || !integritySecret) {
      return res.status(400).json({
        ok: false,
        mensaje: 'El acueducto no tiene configurada su pasarela Wompi.',
      });
    }

    const reference = `${factura.codigoFactura}-${Date.now()}`;
    const amountInCents = Math.round(factura.montoTotal * 100);
    const currency = 'COP';

    // Firma Wompi HMAC-SHA256: reference + amountInCents + currency + integritySecret
    const chain = `${reference}${amountInCents}${currency}${integritySecret}`;
    const signature = crypto.createHash('sha256').update(chain).digest('hex');

    factura.referenciaWompi = reference;
    await factura.save();

    res.json({
      ok: true,
      wompiData: {
        publicKey: acueducto.wompiPublicKey,
        reference,
        amountInCents,
        currency,
        signature,
        redirectUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/pago-confirmado`,
        customerData: {
          email: factura.suscriptorId.correo || 'cliente@aquarural.com',
          fullName: `${factura.suscriptorId.nombres} ${factura.suscriptorId.apellidos}`.trim(),
          phoneNumber: factura.suscriptorId.telefono || '3000000000',
        },
      },
    });
  } catch (error) {
    console.error('Error en iniciarPagoWompi:', error);
    res.status(500).json({
      ok: false,
      mensaje: 'Error al preparar la transacción Wompi.',
    });
  }
};

/**
 * Webhook de confirmación de pago enviado por Wompi
 */
const webhookWompi = async (req, res) => {
  try {
    const { event, data, timestamp, checksum } = req.body;

    if (event !== 'transaction.updated' || !data || !data.transaction) {
      return res.status(200).json({ received: true });
    }

    const transaction = data.transaction;
    const reference = transaction.reference;
    const status = transaction.status;

    const factura = await Factura.findOne({ referenciaWompi: reference }).populate('acueductoId suscriptorId');
    if (!factura) {
      return res.status(200).json({ received: true, note: 'Factura no encontrada para esta referencia' });
    }

    const acueducto = factura.acueductoId;
    const eventsSecret = decrypt(acueducto.wompiEventsSecretEncrypted);

    // Verificar firma del webhook si existe secreto
    if (eventsSecret && checksum) {
      const chain = `${transaction.id}${transaction.status}${transaction.amount_in_cents}${timestamp}${eventsSecret}`;
      const calculatedChecksum = crypto.createHash('sha256').update(chain).digest('hex');
      if (calculatedChecksum !== checksum) {
        console.warn('Firma de webhook Wompi inválida');
        return res.status(400).json({ error: 'Firma checksum inválida' });
      }
    }

    if (status === 'APPROVED') {
      factura.estado = 'PAGADA';
      factura.metodoPago = `WOMPI_${transaction.payment_method_type || 'DIGITAL'}`;
      factura.wompiTransactionId = transaction.id;
      factura.fechaPago = new Date();
      await factura.save();

      // Actualizar estado del suscriptor a AL_DIA
      await Suscriptor.findByIdAndUpdate(factura.suscriptorId._id, {
        estadoMoratorio: 'AL_DIA',
      });
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Error en webhookWompi:', error);
    res.status(500).json({ error: 'Error procesando webhook' });
  }
};

/**
 * Registrar pago presencial en efectivo por el tesorero
 */
const registrarPagoEfectivo = async (req, res) => {
  try {
    const { id } = req.params;
    const factura = await Factura.findById(id);

    if (!factura) {
      return res.status(444).json({ ok: false, mensaje: 'Factura no encontrada.' });
    }

    factura.estado = 'PAGADA';
    factura.metodoPago = 'EFECTIVO_OFICINA';
    factura.fechaPago = new Date();
    await factura.save();

    await Suscriptor.findByIdAndUpdate(factura.suscriptorId, {
      estadoMoratorio: 'AL_DIA',
    });

    res.json({
      ok: true,
      mensaje: 'Pago en efectivo registrado correctamente.',
      factura,
    });
  } catch (error) {
    console.error('Error en registrarPagoEfectivo:', error);
    res.status(500).json({
      ok: false,
      mensaje: 'Error al registrar el pago en efectivo.',
    });
  }
};

module.exports = {
  generarFacturacionMasiva,
  consultarDeudaSuscriptor,
  iniciarPagoWompi,
  webhookWompi,
  registrarPagoEfectivo,
};
