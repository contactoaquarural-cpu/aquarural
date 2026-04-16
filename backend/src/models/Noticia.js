const mongoose = require('mongoose');

const noticiaSchema = new mongoose.Schema(
  {
    titulo: {
      type:     String,
      required: [true, 'El título es obligatorio'],
      trim:     true,
    },
    contenido: {
      type:     String,
      required: [true, 'El contenido es obligatorio'],
      trim:     true,
    },
    imagen: {
      type: String, // URL de Cloudinary
    },
    categoria: {
      type:    String,
      enum:    ['GOBIERNO', 'SANIDAD', 'PRECIOS', 'EVENTO', 'INSTITUCIONAL'],
      default: 'INSTITUCIONAL',
    },
    publicado: {
      type:    Boolean,
      default: false,
    },
    fechaPublicacion: {
      type: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Noticia', noticiaSchema);
