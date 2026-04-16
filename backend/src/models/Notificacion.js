const mongoose = require('mongoose');

const notificacionSchema = new mongoose.Schema(
  {
    asociadoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Asociado',
      required: [true, 'El asociado es obligatorio'],
    },
    titulo: {
      type: String,
      required: [true, 'El título es obligatorio'],
      trim: true,
    },
    mensaje: {
      type: String,
      required: [true, 'El mensaje es obligatorio'],
      trim: true,
    },
    leido: {
      type: Boolean,
      default: false,
    },
    tipo: {
      type: String,
      enum: ['MORA', 'NOTICIA', 'CONVENIO', 'SISTEMA'],
    },
  },
  {
    timestamps: true,
  }
);

notificacionSchema.methods.toJSON = function () {
  const obj = this.toObject();
  return obj;
};

module.exports = mongoose.model('Notificacion', notificacionSchema);
