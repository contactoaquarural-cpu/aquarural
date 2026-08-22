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
      enum: ['SUPERADMIN', 'ADMIN_ACUEDUCTO', 'TESORERO'],
      required: true,
    },
    estado: { type: String, enum: ['ACTIVO', 'INACTIVO'], default: 'ACTIVO' },
    ultimoAcceso: { type: Date },
  },
  { timestamps: true }
);

adminUserSchema.index({ acueductoId: 1, rol: 1 });

adminUserSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.password;
    return ret;
  },
});

module.exports = mongoose.model('AdminUser', adminUserSchema);
