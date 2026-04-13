const mongoose = require('mongoose');

const convenioSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre del convenio es obligatorio'],
      trim: true,
    },
    tipo: {
      type: String,
      enum: ['AGROPECUARIO', 'VETERINARIA', 'INSUMOS', 'OTRO'],
      required: [true, 'El tipo de convenio es obligatorio'],
    },
    descuentoPorcentaje: {
      type: Number,
      min: [0, 'El descuento no puede ser negativo'],
      max: [100, 'El descuento no puede superar el 100%'],
    },
    descripcion: {
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
    activo: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

convenioSchema.methods.toJSON = function () {
  const obj = this.toObject();
  return obj;
};

module.exports = mongoose.model('Convenio', convenioSchema);
