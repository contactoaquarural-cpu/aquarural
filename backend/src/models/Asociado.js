const mongoose = require('mongoose');

const asociadoSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre es obligatorio'],
      trim: true,
    },
    cedula: {
      type: String,
      required: [true, 'La cédula es obligatoria'],
      unique: true,
      trim: true,
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
    municipio: {
      type: String,
      default: 'Garzón',
    },
    estado: {
      type: String,
      enum: ['AL_DIA', 'EN_MORA', 'INACTIVO'],
      default: 'AL_DIA',
    },
    foto: {
      type: String, // URL Cloudinary
    },
    password: {
      type: String,
      required: [true, 'La contraseña es obligatoria'], // bcrypt hash
    },
    fcmToken: {
      type: String, // Token de Firebase para push notifications
    },
    esAdmin: {
      type: Boolean,
      default: false, // true para miembros de la junta directiva
    },
    fechaIngreso: {
      type: Date,
      default: Date.now,
    },
    ultimoAcceso: {
      type: Date,
      default: null, // Se actualiza en cada login
    },
  },
  {
    timestamps: true,
  }
);

asociadoSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('Asociado', asociadoSchema);
