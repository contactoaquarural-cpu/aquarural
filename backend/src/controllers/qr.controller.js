const { z } = require('zod');
const Asociado = require('../models/Asociado');
const { verificarQR } = require('../services/qr.service');
const logger = require('../utils/logger');

const verificarSchema = z.object({
  contenido: z.string().min(1, 'El contenido del QR es obligatorio'),
});

// ─── POST /qr/verificar ───────────────────────────────────────────────────────
// Endpoint público — usado por comercios aliados para validar el carné

exports.verificar = async (req, res) => {
  try {
    const resultado = verificarSchema.safeParse(req.body);
    if (!resultado.success) {
      return res.status(400).json({
        success: false,
        data: null,
        message: resultado.error.errors[0].message,
      });
    }

    const { contenido } = resultado.data;
    const verificacion = verificarQR(contenido);

    if (!verificacion.valido) {
      return res.status(400).json({
        success: false,
        data: null,
        message: verificacion.mensaje,
      });
    }

    // Confirmar en BD que el asociado sigue activo
    const asociado = await Asociado.findById(verificacion.asociado.id).select('-password');

    if (!asociado) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Asociado no encontrado',
      });
    }

    // Estado actualizado desde la BD (puede diferir del QR si cambió recientemente)
    const estadoActual = asociado.estado;
    const esValido = estadoActual !== 'INACTIVO';

    res.status(200).json({
      success: true,
      data: {
        valido: esValido,
        asociado: {
          nombre: asociado.nombre,
          cedula: asociado.cedula,
          estado: estadoActual,
          foto: asociado.foto || null,
          municipio: asociado.municipio,
        },
        expiresAt: verificacion.expiresAt,
        mensaje: esValido
          ? 'Asociado verificado — tiene acceso a los beneficios'
          : 'Asociado inactivo — no tiene acceso a los beneficios',
      },
      message: esValido ? 'QR válido' : 'QR válido pero asociado inactivo',
    });
  } catch (error) {
    logger.error('Error al verificar QR', { error: error.message });
    res.status(500).json({
      success: false,
      data: null,
      message: 'Error interno del servidor',
    });
  }
};
