const { z } = require('zod');

const crearEventoSchema = z.object({
  titulo: z.string().min(1, 'El título es requerido'),
  tipo: z.enum(['ASAMBLEA_GENERAL', 'MANTENIMIENTO_BOCATOMA', 'REUNION_JUNTA']).optional(),
  fecha: z.string().min(1, 'La fecha es requerida'),
  hora: z.string().min(1, 'La hora es requerida'),
  lugar: z.string().min(1, 'El lugar es requerido'),
  descripcion: z.string().optional(),
});

const actualizarEventoSchema = crearEventoSchema.partial().extend({
  estado: z.enum(['PROGRAMADO', 'REALIZADO', 'CANCELADO']).optional(),
});

module.exports = { crearEventoSchema, actualizarEventoSchema };
