const mongoose = require('mongoose');

const precioSchema = new mongoose.Schema({
  categoria: {
    type: String,
    enum: ['GANADO_CARNE', 'GANADO_LECHE', 'INSUMOS'],
    required: true,
  },
  producto:  { type: String, required: true, trim: true },
  unidad:    { type: String, required: true, trim: true },
  precio:    { type: Number, required: true, min: 0 },
  activo:    { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Precio', precioSchema);
