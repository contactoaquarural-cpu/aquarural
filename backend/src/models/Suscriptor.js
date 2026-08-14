const mongoose = require('mongoose');

const suscriptorSchema = new mongoose.Schema(
  {
    acueductoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Acueducto',
      required: [true, 'El acueducto veredal es obligatorio'],
      index: true,
    },
    matricula: {
      type: String,
      required: [true, 'El número de matrícula o cuenta es obligatorio'],
      trim: true,
    },
    cedula: {
      type: String,
      required: [true, 'El número de documento es obligatorio'],
      trim: true,
      index: true,
    },
    nombres: {
      type: String,
      required: [true, 'Los nombres son obligatorios'],
      trim: true,
    },
    apellidos: {
      type: String,
      trim: true,
      default: '',
    },
    telefono: {
      type: String,
      trim: true,
    },
    correo: {
      type: String,
      lowercase: true,
      trim: true,
    },
    vereda: {
      type: String,
      trim: true,
      default: 'Centro Veredal',
    },
    direccion: {
      type: String,
      trim: true,
    },
    numeroMedidor: {
      type: String,
      trim: true,
      default: 'S/N',
    },

    // Geolocalización GPS de la casa/finca
    latitud: {
      type: Number,
      default: null,
    },
    longitud: {
      type: Number,
      default: null,
    },

    // Estado administrativo del servicio de agua
    estadoServicio: {
      type: String,
      enum: ['ACTIVO', 'SUSPENDIDO', 'CORTE_PROGRAMADO'],
      default: 'ACTIVO',
    },

    // Estado moratorio del usuario
    estadoMoratorio: {
      type: String,
      enum: ['AL_DIA', 'EN_MORA', 'INACTIVO'],
      default: 'AL_DIA',
    },

    // Esquema de cobro
    tipoTarifa: {
      type: String,
      enum: ['GENERAL', 'INDIVIDUAL', 'MEDIDA'],
      default: 'GENERAL',
    },
    tarifaPersonalizada: {
      type: Number,
      default: null, // Si tiene tarifa especial asignada
    },

    // Credenciales y Roles
    password: {
      type: String, // bcrypt hash
    },
    pin: {
      type: String, // PIN rápido de 4 dígitos (opcional)
    },
    rol: {
      type: String,
      enum: ['SUPERADMIN', 'ADMIN_ACUEDUCTO', 'TESORERO', 'SUSCRIPTOR'],
      default: 'SUSCRIPTOR',
    },

    fcmToken: {
      type: String, // Token para notificaciones Push Firebase
    },
    fechaVinculacion: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Índice compuesto único por acueducto y matrícula
suscriptorSchema.index({ acueductoId: 1, matricula: 1 }, { unique: true });

suscriptorSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.pin;
  return obj;
};

module.exports = mongoose.model('Suscriptor', suscriptorSchema);
