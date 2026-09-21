const mongoose = require('mongoose');

const lecturaHistoricaSchema = new mongoose.Schema(
  {
    acueductoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Acueducto', required: true, index: true },
    asociadoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Asociado', required: true, index: true },
    periodo: { type: String, required: true }, // YYYY-MM, mes en que se registró la lectura
    lecturaAnterior: { type: Number, required: true, min: 0 },
    lecturaActual: { type: Number, required: true, min: 0 },
    consumoM3: { type: Number, required: true, min: 0 },
    fechaRegistro: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Un registro histórico por asociado por periodo — si se corrige una lectura
// del mismo mes, se actualiza este documento en vez de duplicarlo.
lecturaHistoricaSchema.index({ acueductoId: 1, asociadoId: 1, periodo: 1 }, { unique: true });

module.exports = mongoose.model('LecturaHistorica', lecturaHistoricaSchema);
