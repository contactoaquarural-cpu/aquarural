const mongoose = require('mongoose');

const facturaSchema = new mongoose.Schema(
  {
    acueductoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Acueducto',
      required: [true, 'El acueducto veredal es obligatorio'],
      index: true,
    },
    suscriptorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Suscriptor',
      required: [true, 'El suscriptor es obligatorio'],
      index: true,
    },
    codigoFactura: {
      type: String,
      required: true,
      trim: true,
    },
    periodo: {
      type: String, // YYYY-MM (ej. 2026-08)
      required: [true, 'El periodo de facturación es obligatorio'],
      index: true,
    },
    montoCargoFijo: {
      type: Number,
      default: 0,
    },
    montoConsumo: {
      type: Number,
      default: 0,
    },
    montoMora: {
      type: Number,
      default: 0,
    },
    montoTotal: {
      type: Number,
      required: [true, 'El valor total de la factura es obligatorio'],
      min: 0,
    },
    fechaEmision: {
      type: Date,
      default: Date.now,
    },
    fechaVencimiento: {
      type: Date,
      required: [true, 'La fecha de vencimiento es obligatoria'],
    },
    estado: {
      type: String,
      enum: ['PENDIENTE', 'PAGADA', 'VENCIDA', 'ANULADA'],
      default: 'PENDIENTE',
      index: true,
    },
    metodoPago: {
      type: String,
      enum: ['WOMPI_PSE', 'WOMPI_NEQUI', 'WOMPI_TARJETA', 'WOMPI_BANCOLOMBIA', 'EFECTIVO_OFICINA', 'OTRO'],
      default: null,
    },
    referenciaWompi: {
      type: String,
      default: null,
    },
    wompiTransactionId: {
      type: String,
      default: null,
    },
    fechaPago: {
      type: Date,
      default: null,
    },
    notas: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Índice compuesto único por acueducto, suscriptor y periodo
facturaSchema.index({ acueductoId: 1, suscriptorId: 1, periodo: 1 }, { unique: true });

module.exports = mongoose.model('Factura', facturaSchema);
