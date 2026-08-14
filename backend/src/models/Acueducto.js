const mongoose = require('mongoose');

const acueductoSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre del acueducto veredal es obligatorio'],
      trim: true,
    },
    nit: {
      type: String,
      required: [true, 'El NIT es obligatorio'],
      trim: true,
      unique: true,
    },
    departamento: {
      type: String,
      default: 'Huila',
      trim: true,
    },
    municipio: {
      type: String,
      required: [true, 'El municipio es obligatorio'],
      trim: true,
    },
    vereda: {
      type: String,
      trim: true,
    },
    direccion: {
      type: String,
      trim: true,
    },
    telefono: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    representanteLegal: {
      type: String,
      trim: true,
    },
    logoUrl: {
      type: String,
      default: '',
    },
    colorPrimario: {
      type: String,
      default: '#0EA5E9', // Cyan Hydro 500
    },
    colorSecundario: {
      type: String,
      default: '#10B981', // Emerald Fresh 500
    },
    estado: {
      type: String,
      enum: ['ACTIVO', 'SUSPENDIDO'],
      default: 'ACTIVO',
    },
    planSaaS: {
      type: String,
      enum: ['BASICO', 'ESTANDAR', 'EMPRESARIAL'],
      default: 'BASICO',
    },
    costoMensualSaaS: {
      type: Number,
      default: 0,
    },
    comisionPorTransaccion: {
      type: Number,
      default: 0, // Porcentaje o tarifa fija opcional
    },

    // Credenciales Wompi cifradas por acueducto
    wompiPublicKey: {
      type: String,
      default: '',
    },
    wompiPrivateKeyEncrypted: {
      type: String,
      default: '',
    },
    wompiEventsSecretEncrypted: {
      type: String,
      default: '',
    },
    wompiIntegritySecretEncrypted: {
      type: String,
      default: '',
    },
    wompiSandbox: {
      type: Boolean,
      default: true,
    },

    // Parámetros de cobro del servicio de agua
    tarifaBaseMensual: {
      type: Number,
      default: 25000,
    },
    diaCorteMensual: {
      type: Number,
      default: 30, // Día del mes para vencimiento de factura
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Acueducto', acueductoSchema);
