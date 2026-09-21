const mongoose = require('mongoose');

const facturaSaaSSchema = new mongoose.Schema(
  {
    acueductoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Acueducto', required: true, index: true },
    nit: { type: String, required: true },
    nombreAcueducto: { type: String, required: true },
    codigoFactura: { type: String, required: true, unique: true },
    periodo: { type: String, required: true }, // YYYY-MM
    plan: { type: String, required: true },
    frecuencia: { type: String, enum: ['MENSUAL', 'ANUAL'], required: true },
    montoTotal: { type: Number, required: true, min: 0 },
    fechaEmision: { type: Date, default: Date.now },
    fechaVencimiento: { type: Date, required: true },
    estado: { type: String, enum: ['PENDIENTE', 'PAGADO', 'ANULADO'], default: 'PENDIENTE' },
    metodoPago: { type: String, default: '' },
    referenciaWompi: { type: String, default: '' },
    fechaPago: { type: Date },
  },
  { timestamps: true }
);

facturaSaaSSchema.index({ acueductoId: 1, periodo: 1 });

module.exports = mongoose.model('FacturaSaaS', facturaSaaSSchema);
