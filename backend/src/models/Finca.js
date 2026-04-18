const mongoose = require('mongoose');

const fincaSchema = new mongoose.Schema(
  {
    asociadoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Asociado',
      required: [true, 'El asociado es obligatorio'],
    },
    nombre: {
      type: String,
      required: [true, 'El nombre de la finca es obligatorio'],
      trim: true,
    },
    hectareas: {
      type: Number,
      min: [0, 'Las hectáreas no pueden ser negativas'],
    },
    cabezasGanado: {
      type: Number,
      min: [0, 'Las cabezas de ganado no pueden ser negativas'],
    },
    tipoProduccion: {
      type: String,
      enum: ['CARNE', 'LECHE', 'DOBLE'],
      required: [true, 'El tipo de producción es obligatorio'],
    },
    vereda: {
      type: String,
      trim: true,
    },
    latitud: {
      type: Number,
    },
    longitud: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

fincaSchema.methods.toJSON = function () {
  const obj = this.toObject();
  return obj;
};

module.exports = mongoose.model('Finca', fincaSchema);
