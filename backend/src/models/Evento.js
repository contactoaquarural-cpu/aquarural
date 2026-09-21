const mongoose = require('mongoose');

const eventoSchema = new mongoose.Schema(
  {
    acueductoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Acueducto', required: true, index: true },
    titulo: { type: String, required: true, trim: true },
    tipo: {
      type: String,
      enum: ['ASAMBLEA_GENERAL', 'MANTENIMIENTO_BOCATOMA', 'REUNION_JUNTA'],
      default: 'ASAMBLEA_GENERAL',
    },
    fecha: { type: String, required: true }, // YYYY-MM-DD
    hora: { type: String, required: true, trim: true },
    lugar: { type: String, required: true, trim: true },
    descripcion: { type: String, default: '', trim: true },
    estado: { type: String, enum: ['PROGRAMADO', 'REALIZADO', 'CANCELADO'], default: 'PROGRAMADO' },

    // Respuestas de asistencia (asociadoId -> 'SI'|'NO'), a llenar cuando la
    // app móvil de suscriptores tenga login propio (ver PLAN_DE_TRABAJO.md).
    // Sin login de suscriptores todavía no hay quién responda de verdad, así
    // que el panel admin no debe simular ni mostrar RSVP mientras tanto.
    respuestasRSVP: { type: Map, of: String, default: {} },
  },
  { timestamps: true }
);

eventoSchema.index({ acueductoId: 1, fecha: -1 });

module.exports = mongoose.model('Evento', eventoSchema);
