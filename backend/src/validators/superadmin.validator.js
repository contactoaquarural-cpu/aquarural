const { z } = require('zod');

const crearAcueductoSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  nit: z.string().min(1, 'El NIT es requerido'),
  departamento: z.string().optional(),
  municipio: z.string().min(1, 'El municipio es requerido'),
  vereda: z.string().optional(),
  direccion: z.string().optional(),
  telefono: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  representanteLegal: z.string().optional(),
  tipoTarifa: z.enum(['TARIFA_FIJA', 'HIBRIDO', 'MEDIDOR']).optional(),
  tarifaBaseMensual: z.number().nonnegative().optional(),
  cargoFijoMensual: z.number().nonnegative().optional(),
  valorMetroCubico: z.number().nonnegative().optional(),
  consumoBasicoIncluido: z.number().nonnegative().optional(),
  montoRecargoMora: z.number().nonnegative().optional(),
  diaLimitePago: z.number().int().min(1).max(31).optional(),
  // planSaaS y costoSaaSVigente NO se reciben del cliente: se calculan en el
  // backend según el número de suscriptores y la frecuencia elegida (ver
  // config/planes-saas.js), para que nunca queden desincronizados del precio real.
  frecuenciaPagoSaaS: z.enum(['MENSUAL', 'ANUAL']).optional(),
  adminNombre: z.string().min(1, 'El nombre del administrador es requerido'),
  adminCorreo: z.string().email('Correo del administrador inválido'),
  adminPassword: z.string().min(6, 'La contraseña del administrador debe tener al menos 6 caracteres'),
});

const actualizarAcueductoSchema = crearAcueductoSchema
  .partial()
  .omit({ adminNombre: true, adminCorreo: true, adminPassword: true })
  .extend({
    // Ajuste manual de fechas de licencia, uso del SuperAdmin (ej. casos
    // especiales o datos de prueba) — el flujo normal las mueve solo vía
    // confirmarPagoSaaS y el job de recálculo.
    fechaVencimientoGratis: z.coerce.date().optional(),
    fechaVencimientoMembresia: z.coerce.date().optional(),
    // Toggle de acceso al panel (activar/suspender) desde la tabla de SuperAdmin.
    estado: z.enum(['ACTIVO', 'SUSPENDIDO']).optional(),
  });

const actualizarConfiguracionGlobalSchema = z.object({
  heroImagenUrl: z.string().url('URL de imagen inválida').optional().or(z.literal('')),
  loginImagenUrl: z.string().url('URL de imagen inválida').optional().or(z.literal('')),
});

module.exports = { crearAcueductoSchema, actualizarAcueductoSchema, actualizarConfiguracionGlobalSchema };
