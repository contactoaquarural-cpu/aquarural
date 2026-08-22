const mongoose = require('mongoose');

const asociadoSchema = new mongoose.Schema(
  {
    acueductoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Acueducto', required: true },
    matricula: { type: String, required: true, trim: true },
    cedula: { type: String, required: true, trim: true },
    nombres: { type: String, required: true, trim: true },
    apellidos: { type: String, default: '', trim: true },
    telefono: { type: String, trim: true },
    correo: { type: String, lowercase: true, trim: true },

    // Datos de predio, embebidos directamente (sin modelo Finca separado)
    direccion: { type: String, trim: true },
    vereda: { type: String, default: 'Centro', trim: true },
    latitud: { type: Number },
    longitud: { type: Number },
    numeroMedidor: { type: String, default: 'S/N', trim: true },

    estadoServicio: {
      type: String,
      enum: ['ACTIVO', 'SUSPENDIDO', 'CORTE_PROGRAMADO'],
      default: 'ACTIVO',
    },
    estadoMoratorio: {
      type: String,
      enum: ['AL_DIA', 'EN_MORA', 'INACTIVO'],
      default: 'AL_DIA',
    },
    tipoTarifa: {
      type: String,
      enum: ['GENERAL', 'COMERCIAL', 'SUBSIDIADO', 'ADULTO_MAYOR', 'ESPECIAL'],
      default: 'GENERAL',
    },
    tarifaPersonalizada: { type: Number },

    fechaVinculacion: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

asociadoSchema.index({ acueductoId: 1, cedula: 1 }, { unique: true });
asociadoSchema.index({ acueductoId: 1, matricula: 1 }, { unique: true });

module.exports = mongoose.model('Asociado', asociadoSchema);
