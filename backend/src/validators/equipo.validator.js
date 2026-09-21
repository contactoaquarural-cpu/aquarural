const { z } = require('zod');

const crearMiembroEquipoSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  correo: z.string().email('Correo inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  rol: z.enum(['TESORERO', 'FONTANERO']),
  // Solo tiene efecto si rol es FONTANERO — ver comentario en AdminUser.js.
  veredasAsignadas: z.array(z.string()).optional(),
});

const actualizarMiembroEquipoSchema = z.object({
  nombre: z.string().min(1).optional(),
  estado: z.enum(['ACTIVO', 'INACTIVO']).optional(),
  veredasAsignadas: z.array(z.string()).optional(),
  // Restablecer contraseña: el admin del acueducto define una nueva
  // contraseña temporal para su Fontanero/Tesorero cuando la olvida — no hay
  // flujo de recuperación por correo, así que esta es la única salida.
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres').optional(),
});

module.exports = { crearMiembroEquipoSchema, actualizarMiembroEquipoSchema };
