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
      enum: ['MORA', 'NOTICIA', 'CONVENIO', 'GANADERO_TV', 'PRECIO', 'MERCADO', 'SISTEMA', 'EVENTO'],
    },
    eventoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref:  'Evento',
      default: null,
    },
    // Para eventos: solo se marca leído con acción explícita del asociado
    requiereConfirmacion: {
      type:    Boolean,
      default: false,
    },
    // Respuesta del asociado al evento
    respuesta: {
      type:    String,
      enum:    ['ASISTIRE', 'NO_ASISTIRE', null],
      default: null,
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
