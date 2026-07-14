const mongoose = require('mongoose');

const configuracionSchema = new mongoose.Schema(
  {
    montoAporte: {
      type:     Number,
      required: true,
      min:      1000,
      default:  50000,
    },
    nombreAsociacion: {
      type:    String,
      default: 'Asociación de Ganaderos',
    },
    municipio: {
      type:    String,
      default: 'Garzón, Huila',
    },
    telefonoContacto: {
      type:    String,
      default: '3166160377',
    },
  },
  { timestamps: true }
);

// Solo puede existir un documento de configuración
configuracionSchema.statics.obtener = async function () {
  let config = await this.findOne();
  if (!config) config = await this.create({});
  return config;
};

module.exports = mongoose.model('Configuracion', configuracionSchema);
