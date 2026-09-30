const mongoose = require('mongoose');

// Historial persistido de avisos enviados a un suscriptor — complementa al
// push efímero de Firebase (que desaparece si el celular estaba apagado o
// la app no tenía permiso todavía). La bandeja de notificaciones de la app
// móvil lista estos registros; el push es solo el mecanismo de entrega
// inmediata, no la fuente de verdad de qué se le avisó a quién.
const notificacionSchema = new mongoose.Schema(
  {
    acueductoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Acueducto', required: true, index: true },
    asociadoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Asociado', required: true, index: true },
    tipo: {
      type: String,
      enum: ['PAGO_CONFIRMADO', 'FACTURA_VENCIDA', 'PROXIMO_VENCIMIENTO', 'EN_MORA', 'EVENTO'],
      required: true,
    },
    titulo: { type: String, required: true, trim: true },
    cuerpo: { type: String, required: true, trim: true },
    // Referencia libre al documento relacionado (facturaId, eventoId, etc.)
    // — no se modela como ref tipado porque el tipo de documento varía
    // según `tipo`, y esta notificación no necesita poblarlo, solo guardarlo
    // para que la app arme el link/navegación si quiere.
    referenciaId: { type: String, default: '' },
    leida: { type: Boolean, default: false },
  },
  { timestamps: true }
);

notificacionSchema.index({ acueductoId: 1, asociadoId: 1, createdAt: -1 });

module.exports = mongoose.model('Notificacion', notificacionSchema);
