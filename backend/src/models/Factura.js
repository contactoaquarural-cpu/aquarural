const mongoose = require('mongoose');

const facturaSchema = new mongoose.Schema(
  {
    acueductoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Acueducto', required: true, index: true },
    asociadoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Asociado', required: true, index: true },
    codigoFactura: { type: String, required: true },
    periodo: { type: String, required: true, index: true }, // YYYY-MM

    montoCargoFijo: { type: Number, default: 0, min: 0 },
    montoConsumo: { type: Number, default: 0, min: 0 },
    montoMora: { type: Number, default: 0, min: 0 },
    montoRecargoLicencia: { type: Number, default: 0, min: 0 },
    montoTotal: { type: Number, required: true, min: 0 },

    consumoM3: { type: Number, default: 0, min: 0 },

    fechaEmision: { type: Date, default: Date.now },
    fechaVencimiento: { type: Date, required: true },
    estado: { type: String, enum: ['PENDIENTE', 'PAGADA', 'VENCIDA', 'ANULADA'], default: 'PENDIENTE' },
    metodoPago: { type: String, enum: ['', 'WOMPI', 'EFECTIVO_OFICINA'], default: '' },
    referenciaWompi: { type: String, default: '' },
    wompiTransactionId: { type: String, default: '' },
    fechaPago: { type: Date },
    notas: { type: String, default: '' },
  },
  { timestamps: true }
);

facturaSchema.index({ acueductoId: 1, asociadoId: 1, periodo: 1 }, { unique: true });

// Único solo cuando hay una referencia real: el webhook busca la factura por
// esta referencia sin filtrar por acueducto, así que dos facturas nunca deben
// poder compartirla. Parcial (no aplica a '') porque todas las facturas sin
// pago iniciado comparten el default ''.
facturaSchema.index(
  { referenciaWompi: 1 },
  { unique: true, partialFilterExpression: { referenciaWompi: { $gt: '' } } }
);

module.exports = mongoose.model('Factura', facturaSchema);
