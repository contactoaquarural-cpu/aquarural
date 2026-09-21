const mongoose = require('mongoose');

const adminUserSchema = new mongoose.Schema(
  {
    acueductoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Acueducto',
      required: function () {
        return this.rol !== 'SUPERADMIN';
      },
      default: null,
    },
    nombre: { type: String, required: true, trim: true },
    correo: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    rol: {
      type: String,
      enum: ['SUPERADMIN', 'ADMIN_ACUEDUCTO', 'TESORERO', 'FONTANERO'],
      required: true,
    },
    estado: { type: String, enum: ['ACTIVO', 'INACTIVO'], default: 'ACTIVO' },
    ultimoAcceso: { type: Date },
    // Solo aplica a FONTANERO: veredas que cubre en campo. Vacío/ausente =
    // ve todo el padrón del acueducto (retrocompatible con fontaneros ya
    // creados antes de esta asignación, y comportamiento por defecto para
    // acueductos pequeños con un solo fontanero cubriendo todo).
    veredasAsignadas: { type: [String], default: [] },
  },
  { timestamps: true }
);

adminUserSchema.index({ acueductoId: 1, rol: 1 });

// Mismo criterio de normalización ya aplicado en Asociado.js — Title Case
// para que "juan perez"/"MARIA GOMEZ" no se mezclen sin formato en la lista
// de Equipo de Trabajo, sin importar si el nombre entra por el alta de un
// nuevo acueducto (SuperAdmin) o por /equipo (admin del propio acueducto).
const aTitleCase = (texto) =>
  texto
    .toLowerCase()
    .split(' ')
    .filter(Boolean)
    .map((palabra) => palabra.charAt(0).toUpperCase() + palabra.slice(1))
    .join(' ');

adminUserSchema.pre('save', function (next) {
  if (this.nombre) this.nombre = aTitleCase(this.nombre);
  next();
});

// findOneAndUpdate no dispara pre('save') — el controller de "actualizar" en
// equipo.controller.js usa findOneAndUpdate, así que necesita su propio hook.
adminUserSchema.pre('findOneAndUpdate', function (next) {
  if (this._update.nombre) this._update.nombre = aTitleCase(this._update.nombre);
  next();
});

adminUserSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.password;
    return ret;
  },
});

module.exports = mongoose.model('AdminUser', adminUserSchema);
