const mongoose = require('mongoose');

const eventoSchema = new mongoose.Schema(
  {
    titulo: {
      type:     String,
      required: [true, 'El título es obligatorio'],
      trim:     true,
    },
    descripcion: {
      type:  String,
      trim:  true,
      default: '',
    },
    fecha: {
      type:     Date,
      required: [true, 'La fecha es obligatoria'],
    },
    lugar: {
      type:  String,
      trim:  true,
      default: '',
    },
    tipo: {
      type:    String,
      enum:    ['COMITE', 'REUNION', 'CAPACITACION', 'OTRO'],
      default: 'REUNION',
    },
    creadoPor: {
      type: mongoose.Schema.Types.ObjectId,
      ref:  'Asociado',
    },
    notificacionEnviada: {
      type:    Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Evento', eventoSchema);
