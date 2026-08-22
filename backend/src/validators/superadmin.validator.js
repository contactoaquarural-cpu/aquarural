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
  // planSaaS y costoSaaSVigente NO se reciben del cliente: se calculan en el
  // backend según el número de suscriptores y la frecuencia elegida (ver
  // config/planes-saas.js), para que nunca queden desincronizados del precio real.
  frecuenciaPagoSaaS: z.enum(['MENSUAL', 'ANUAL']).optional(),
  wompiPublicKey: z.string().optional(),
  wompiPrivateKey: z.string().optional(),
  wompiEventsSecret: z.string().optional(),
  wompiIntegritySecret: z.string().optional(),
  wompiSandbox: z.boolean().optional(),
  adminNombre: z.string().min(1, 'El nombre del administrador es requerido'),
  adminCorreo: z.string().email('Correo del administrador inválido'),
  adminPassword: z.string().min(6, 'La contraseña del administrador debe tener al menos 6 caracteres'),
});

const actualizarAcueductoSchema = crearAcueductoSchema.partial().omit({
  adminNombre: true,
  adminCorreo: true,
  adminPassword: true,
});

module.exports = { crearAcueductoSchema, actualizarAcueductoSchema };
