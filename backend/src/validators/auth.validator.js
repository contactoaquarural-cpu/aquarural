const { z } = require('zod');

const loginSchema = z.object({
  correo: z.string().email('Correo inválido'),
  password: z.string().min(1, 'La contraseña es requerida'),
});

const loginAsociadoSchema = z.object({
  acueductoId: z.string().min(1, 'Debes seleccionar un acueducto'),
  cedula: z.string().min(1, 'La cédula es requerida'),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'refreshToken es requerido'),
});

const cambiarPasswordSchema = z.object({
  passwordActual: z.string().min(1),
  passwordNuevo: z.string().min(6, 'La nueva contraseña debe tener al menos 6 caracteres'),
});

const verificarPasswordSchema = z.object({
  password: z.string().min(1, 'La contraseña es requerida'),
});

module.exports = { loginSchema, loginAsociadoSchema, refreshSchema, cambiarPasswordSchema, verificarPasswordSchema };
