const mongoose = require('mongoose');

const aporteSchema = new mongoose.Schema(
  {
    asociadoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Asociado',
      required: [true, 'El asociado es obligatorio'],
    },
    mes: {
      type: Number,
      required: [true, 'El mes es obligatorio'],
      min: [1, 'El mes mínimo es 1'],
      max: [12, 'El mes máximo es 12'],
    },
    año: {
      type: Number,
      required: [true, 'El año es obligatorio'],
    },
    monto: {
      type: Number,
      required: [true, 'El monto es obligatorio'],
    },
    estado: {
      type: String,
      enum: ['PAGADO', 'PENDIENTE'],
      default: 'PENDIENTE',
    },
    fechaPago: {
      type: Date,
    },
    referenciaPago: {
      type: String,
      trim: true,
    },
    metodoPago: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

aporteSchema.methods.toJSON = function () {
  const obj = this.toObject();
  return obj;
};

module.exports = mongoose.model('Aporte', aporteSchema);
