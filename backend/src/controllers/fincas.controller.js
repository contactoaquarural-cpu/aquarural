const { z } = require('zod');
const Finca = require('../models/Finca');
const logger = require('../utils/logger');

const fincaSchema = z.object({
  asociadoId: z.string().min(1, 'El asociado es obligatorio'),
  nombre: z.string().min(2, 'El nombre de la finca es obligatorio'),
  hectareas: z.number().min(0).optional(),
  cabezasGanado: z.number().min(0).optional(),
  tipoProduccion: z.enum(['CARNE', 'LECHE', 'DOBLE'], {
    errorMap: () => ({ message: 'Tipo de producción inválido. Usa: CARNE, LECHE o DOBLE' }),
  }),
  vereda: z.string().optional(),
});

const actualizarSchema = fincaSchema.omit({ asociadoId: true }).partial();

// ─── POST /fincas ─────────────────────────────────────────────────────────────

exports.crear = async (req, res) => {
  try {
    const resultado = fincaSchema.safeParse(req.body);
    if (!resultado.success) {
      return res.status(400).json({
        success: false,
        data: null,
        message: resultado.error.errors[0].message,
      });
    }

    const finca = await Finca.create(resultado.data);

    res.status(201).json({
      success: true,
      data: finca,
      message: 'Finca registrada exitosamente',
    });
  } catch (error) {
    logger.error('Error al crear finca', { error: error.message });
    res.status(500).json({ success: false, data: null, message: 'Error interno del servidor' });
  }
};

// ─── GET /fincas/:id ──────────────────────────────────────────────────────────

exports.obtenerPorId = async (req, res) => {
  try {
    const finca = await Finca.findById(req.params.id).populate('asociadoId', 'nombre cedula');

    if (!finca) {
      return res.status(404).json({ success: false, data: null, message: 'Finca no encontrada' });
    }

    res.status(200).json({
      success: true,
      data: finca,
      message: 'Finca obtenida exitosamente',
    });
  } catch (error) {
    logger.error('Error al obtener finca', { error: error.message });
    res.status(500).json({ success: false, data: null, message: 'Error interno del servidor' });
  }
};

// ─── PUT /fincas/:id ──────────────────────────────────────────────────────────

exports.actualizar = async (req, res) => {
  try {
    const resultado = actualizarSchema.safeParse(req.body);
    if (!resultado.success) {
      return res.status(400).json({
        success: false,
        data: null,
        message: resultado.error.errors[0].message,
      });
    }

    const finca = await Finca.findByIdAndUpdate(
      req.params.id,
      resultado.data,
      { new: true, runValidators: true }
    );

    if (!finca) {
      return res.status(404).json({ success: false, data: null, message: 'Finca no encontrada' });
    }

    res.status(200).json({
      success: true,
      data: finca,
      message: 'Finca actualizada exitosamente',
    });
  } catch (error) {
    logger.error('Error al actualizar finca', { error: error.message });
    res.status(500).json({ success: false, data: null, message: 'Error interno del servidor' });
  }
};

// ─── GET /asociados/:id/fincas ────────────────────────────────────────────────

exports.listarPorAsociado = async (req, res) => {
  try {
    const fincas = await Finca.find({ asociadoId: req.params.id }).sort({ nombre: 1 });

    res.status(200).json({
      success: true,
      data: fincas,
      message: 'Fincas obtenidas exitosamente',
    });
  } catch (error) {
    logger.error('Error al listar fincas del asociado', { error: error.message });
    res.status(500).json({ success: false, data: null, message: 'Error interno del servidor' });
  }
};
