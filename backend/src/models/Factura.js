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
    // Comisión de la pasarela Wompi (2.65% + $700 COP + IVA 19% sobre esa
    // comisión), solo si el acueducto activó trasladarComisionWompiAsociados.
    // Queda en 0 hasta que el pago se confirme por Wompi — nunca aplica al
    // pago en efectivo en oficina, que no pasa por la pasarela. montoTotal
    // sigue siendo el valor real del agua (lo que factura el acueducto); esta
    // comisión se suma aparte solo al checkout de Wompi y al recibo final,
    // para que quede siempre claro cuánto es agua y cuánto es la pasarela.
    montoComisionWompi: { type: Number, default: 0, min: 0 },
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

    // Evita reenviar el recordatorio de "vence pronto" cada día durante la
    // ventana de aviso — se marca true la primera vez que se envía y ya no
    // se vuelve a tocar (una factura VENCIDA nunca vuelve a PENDIENTE, así
    // que no hace falta resetearlo).
    recordatorioEnviado: { type: Boolean, default: false },
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
