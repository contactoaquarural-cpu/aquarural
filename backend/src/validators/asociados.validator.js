const { z } = require('zod');

const crearAsociadoSchema = z.object({
  matricula: z.string().min(1, 'La matrícula es requerida'),
  cedula: z.string().min(1, 'La cédula es requerida'),
  nombres: z.string().min(1, 'El nombre es requerido'),
  apellidos: z.string().optional(),
  telefono: z.string().optional(),
  correo: z.string().email().optional().or(z.literal('')),
  direccion: z.string().optional(),
  vereda: z.string().optional(),
  latitud: z.number().optional(),
  longitud: z.number().optional(),
  numeroMedidor: z.string().optional(),
  tipoTarifa: z.enum(['GENERAL', 'COMERCIAL', 'SUBSIDIADO', 'ADULTO_MAYOR', 'ESPECIAL']).optional(),
  tarifaPersonalizada: z.number().nonnegative().optional(),
});

const actualizarAsociadoSchema = crearAsociadoSchema.partial().extend({
  estadoServicio: z.enum(['ACTIVO', 'SUSPENDIDO', 'CORTE_PROGRAMADO']).optional(),
});

module.exports = { crearAsociadoSchema, actualizarAsociadoSchema };
