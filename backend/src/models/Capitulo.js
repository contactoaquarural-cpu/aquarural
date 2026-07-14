const mongoose = require('mongoose');

const capituloSchema = new mongoose.Schema(
  {
    numero: {
      type: Number,
      required: true,
      min: 1,
    },
    titulo: {
      type: String,
      required: true,
      trim: true,
    },
    descripcion: {
      type: String,
      trim: true,
    },
    // URL del video en Cloudinary (resource_type: 'video')
    videoUrl: {
      type: String,
      required: true,
    },
    // Cloudinary genera el thumbnail automáticamente del primer frame
    // cambiando la extensión de .mp4 a .jpg en la URL
    thumbnailUrl: {
      type: String,
    },
    // Duración en segundos (opcional, se puede llenar manualmente)
    duracion: {
      type: Number,
      min: 0,
    },
    publicado: {
      type: Boolean,
      default: false,
    },
    fechaPublicacion: {
      type: Date,
    },
  },
  { timestamps: true }
);

capituloSchema.index({ publicado: 1, numero: 1 });

module.exports = mongoose.model('Capitulo', capituloSchema);
