const mongoose = require('mongoose');

const acueductoSchema = new mongoose.Schema(
  {
    // Identidad
    nombre: { type: String, required: true, trim: true },
    nit: { type: String, required: true, unique: true, trim: true },
    departamento: { type: String, default: 'Huila', trim: true },
    municipio: { type: String, required: true, trim: true },
    vereda: { type: String, trim: true },
    direccion: { type: String, trim: true },
    telefono: { type: String, trim: true },
    email: { type: String, lowercase: true, trim: true },
    representanteLegal: { type: String, trim: true },
    logoUrl: { type: String, default: '' },
    colorPrimario: { type: String, default: '#0EA5E9' },
    colorSecundario: { type: String, default: '#10B981' },
    estado: { type: String, enum: ['ACTIVO', 'SUSPENDIDO'], default: 'ACTIVO' },

    // Tarifas de agua (acueducto -> asociado)
    tipoTarifa: { type: String, enum: ['TARIFA_FIJA', 'HIBRIDO', 'MEDIDOR'], default: 'HIBRIDO' },
    tarifaBaseMensual: { type: Number, default: 0 },
    cargoFijoMensual: { type: Number, default: 0 },
    valorMetroCubico: { type: Number, default: 0 },
    consumoBasicoIncluido: { type: Number, default: 0 },
    montoRecargoMora: { type: Number, default: 0 },
    diaLimitePago: { type: Number, default: 15 },

    // Traslado opcional del costo de la licencia SaaS a los asociados, como
    // rubro separado y visible en cada factura de agua (no mezclado con
    // cargoFijoMensual). Se recalcula en cada generación de factura según
    // costoSaaSVigente mensualizado ÷ asociados activos.
    trasladarCostoLicenciaAsociados: { type: Boolean, default: false },

    // Wompi propio del acueducto (cobro de agua), cifrado AES-256
    wompiPublicKey: { type: String, default: '' },
    wompiPrivateKeyEncrypted: { type: String, default: '' },
    wompiEventsSecretEncrypted: { type: String, default: '' },
    wompiIntegritySecretEncrypted: { type: String, default: '' },
    wompiSandbox: { type: Boolean, default: true },

    // Licencia SaaS (MetaDevelopment -> acueducto). El plan se determina por
    // rango de suscriptores (ver config/planes-saas.js) y se recalcula en
    // cada renovación, no en tiempo real al crecer.
    planSaaS: { type: String, enum: ['MANANTIAL', 'CAUDAL', 'CUENCA', 'ACUIFERO'], default: 'MANANTIAL' },
    frecuenciaPagoSaaS: { type: String, enum: ['MENSUAL', 'ANUAL'], default: 'ANUAL' },
    costoSaaSVigente: { type: Number, default: 0 },
    fechaInicioLicencia: { type: Date, default: Date.now },
    fechaVencimientoGratis: { type: Date },
    fechaVencimientoMembresia: { type: Date },
    estadoPagoSaaS: {
      type: String,
      enum: ['MES_GRATIS_PRUEBA', 'AL_DIA', 'POR_COBRAR', 'VENCIDO'],
      default: 'MES_GRATIS_PRUEBA',
    },
  },
  { timestamps: true }
);

acueductoSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.wompiPrivateKeyEncrypted;
    delete ret.wompiEventsSecretEncrypted;
    delete ret.wompiIntegritySecretEncrypted;
    return ret;
  },
});

module.exports = mongoose.model('Acueducto', acueductoSchema);
