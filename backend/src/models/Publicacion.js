const mongoose = require('mongoose');

const publicacionSchema = new mongoose.Schema(
  {
    asociadoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Asociado',
      required: true,
    },
    titulo: {
      type: String,
      required: true,
      trim: true,
    },
    descripcion: {
      type: String,
      required: true,
      trim: true,
    },
    categoria: {
      type: String,
      enum: ['ANIMAL', 'TERRENO', 'FINCA', 'INSUMO', 'OTRO'],
      required: true,
    },
    subcategoria: {
      type: String,
      trim: true,
    },
    precio: {
      type: Number,
      min: 0,
    },
    negociable: {
      type: Boolean,
      default: false,
    },
    fotos: {
      type: [String],
      default: [],
      validate: {
        validator: (arr) => arr.length <= 5,
        message: 'Máximo 5 fotos por publicación',
      },
    },
    municipio: {
      type: String,
      trim: true,
      default: 'Garzón',
    },
    vereda: {
      type: String,
      trim: true,
    },
    contacto: {
      telefono: { type: String, trim: true },
      whatsapp: { type: String, trim: true },
    },
    // PENDIENTE → espera aprobación del admin
    // APROBADO  → visible en el mercado
    // RECHAZADO → no visible, admin dejó motivo
    estado: {
      type: String,
      enum: ['PENDIENTE', 'APROBADO', 'RECHAZADO'],
      default: 'PENDIENTE',
    },
    motivoRechazo: {
      type: String,
      trim: true,
    },
    activo: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Índices para búsquedas frecuentes
publicacionSchema.index({ estado: 1, activo: 1, createdAt: -1 });
publicacionSchema.index({ asociadoId: 1 });
publicacionSchema.index({ categoria: 1 });

module.exports = mongoose.model('Publicacion', publicacionSchema);
