const mongoose = require('mongoose');

// Documento único (singleton) con la apariencia global de la plataforma
// AquaRural SaaS: imágenes de marketing/marca compartidas por landing y
// web-admin, gestionadas solo por el SUPERADMIN dueño de la SaaS. No tiene
// relación con la personalización por acueducto (logoUrl/colorPrimario en
// Acueducto.js), que es propia de cada cliente afiliado.
const configuracionGlobalSchema = new mongoose.Schema(
  {
    heroImagenUrl: { type: String, default: '' },
    loginImagenUrl: { type: String, default: '' },
  },
  { timestamps: true }
);

configuracionGlobalSchema.statics.obtenerSingleton = async function obtenerSingleton() {
  let doc = await this.findOne();
  if (!doc) doc = await this.create({});
  return doc;
};

module.exports = mongoose.model('ConfiguracionGlobal', configuracionGlobalSchema);
