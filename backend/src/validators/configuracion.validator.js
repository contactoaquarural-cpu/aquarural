const { z } = require('zod');

// El admin del acueducto solo puede editar parámetros operativos de tarifa,
// nunca identidad (nombre, NIT) ni licencia SaaS — eso es exclusivo del SuperAdmin.
const actualizarConfiguracionSchema = z.object({
  tipoTarifa: z.enum(['TARIFA_FIJA', 'HIBRIDO', 'MEDIDOR']).optional(),
  tarifaBaseMensual: z.number().nonnegative().optional(),
  cargoFijoMensual: z.number().nonnegative().optional(),
  valorMetroCubico: z.number().nonnegative().optional(),
  consumoBasicoIncluido: z.number().nonnegative().optional(),
  montoRecargoMora: z.number().nonnegative().optional(),
  diaLimitePago: z.number().int().min(1).max(31).optional(),
  trasladarCostoLicenciaAsociados: z.boolean().optional(),
  telefono: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  // Llaves Wompi propias del acueducto (cobro de agua), cifradas antes de
  // guardarse — ver construirCamposWompi en configuracion.controller.js.
  wompiPublicKey: z.string().optional(),
  wompiPrivateKey: z.string().optional(),
  wompiEventsSecret: z.string().optional(),
  wompiIntegritySecret: z.string().optional(),
  wompiSandbox: z.boolean().optional(),
});

module.exports = { actualizarConfiguracionSchema };
