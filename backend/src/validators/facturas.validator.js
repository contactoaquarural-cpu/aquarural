const { z } = require('zod');

const generarMasivaSchema = z.object({
  periodo: z.string().regex(/^\d{4}-\d{2}$/, 'El periodo debe tener formato YYYY-MM'),
});

const anularPeriodoSchema = z.object({
  periodo: z.string().regex(/^\d{4}-\d{2}$/, 'El periodo debe tener formato YYYY-MM'),
});

const pagoEfectivoSchema = z.object({
  notas: z.string().optional(),
});

const registrarLecturaSchema = z.object({
  lecturaActual: z.number().nonnegative('La lectura debe ser un número positivo'),
});

const registrarLecturasMasivasSchema = z.object({
  lecturas: z.array(
    z.object({
      asociadoId: z.string().min(1),
      lecturaActual: z.number().nonnegative(),
    })
  ),
});

module.exports = {
  generarMasivaSchema,
  anularPeriodoSchema,
  pagoEfectivoSchema,
  registrarLecturaSchema,
  registrarLecturasMasivasSchema,
};
