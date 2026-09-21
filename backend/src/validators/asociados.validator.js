const { z } = require('zod');

const crearAsociadoSchema = z.object({
  // Si no se envía, el backend genera el siguiente consecutivo del acueducto
  // (ACU-0001, ACU-0002, ...) — ver generarSiguienteMatricula en el controller.
  matricula: z.string().min(1).optional(),
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
  // Lectura de arranque de un medidor ya existente (no nuevo): sin esto, el
  // frontend las calcula y las manda, pero Zod las descartaba en silencio,
  // dejando el medidor guardado en 0 como si fuera nuevo (ver PLAN_DE_TRABAJO.md).
  lecturaAnterior: z.number().nonnegative().optional(),
  lecturaActual: z.number().nonnegative().optional(),
  tarifaPersonalizada: z.number().nonnegative().optional(),
});

const actualizarAsociadoSchema = crearAsociadoSchema.partial().extend({
  estadoServicio: z.enum(['ACTIVO', 'SUSPENDIDO', 'CORTE_PROGRAMADO']).optional(),
});

const actualizarGpsSchema = z.object({
  latitud: z.number(),
  longitud: z.number(),
});

module.exports = { crearAsociadoSchema, actualizarAsociadoSchema, actualizarGpsSchema };
