const { z } = require('zod');
const Convenio = require('../models/Convenio');
const logger = require('../utils/logger');

const convenioSchema = z.object({
  nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  tipo: z.enum(['AGROPECUARIO', 'VETERINARIA', 'INSUMOS', 'OTRO'], {
    errorMap: () => ({ message: 'Tipo inválido. Usa: AGROPECUARIO, VETERINARIA, INSUMOS u OTRO' }),
  }),
  descuentoPorcentaje: z.number().min(0).max(100).optional(),
  descripcion: z.string().optional(),
  direccion: z.string().optional(),
  telefono: z.string().optional(),
});

const actualizarSchema = convenioSchema.partial();

// ─── GET /convenios ───────────────────────────────────────────────────────────

exports.listar = async (req, res) => {
  try {
    const filtro = { activo: true };
    if (req.query.tipo) filtro.tipo = req.query.tipo;

    const convenios = await Convenio.find(filtro).sort({ nombre: 1 });

    res.status(200).json({
      success: true,
      data: convenios,
      message: 'Convenios obtenidos exitosamente',
    });
  } catch (error) {
    logger.error('Error al listar convenios', { error: error.message });
    res.status(500).json({ success: false, data: null, message: 'Error interno del servidor' });
  }
};

// ─── GET /convenios/:id ───────────────────────────────────────────────────────

exports.obtenerPorId = async (req, res) => {
  try {
    const convenio = await Convenio.findById(req.params.id);

    if (!convenio) {
      return res.status(404).json({ success: false, data: null, message: 'Convenio no encontrado' });
    }

    res.status(200).json({
      success: true,
      data: convenio,
      message: 'Convenio obtenido exitosamente',
    });
  } catch (error) {
    logger.error('Error al obtener convenio', { error: error.message });
    res.status(500).json({ success: false, data: null, message: 'Error interno del servidor' });
  }
};

// ─── POST /convenios ──────────────────────────────────────────────────────────

exports.crear = async (req, res) => {
  try {
    const resultado = convenioSchema.safeParse(req.body);
    if (!resultado.success) {
      return res.status(400).json({
        success: false,
        data: null,
        message: resultado.error.errors[0].message,
      });
    }

    const convenio = await Convenio.create(resultado.data);

    res.status(201).json({
      success: true,
      data: convenio,
      message: 'Convenio creado exitosamente',
    });
  } catch (error) {
    logger.error('Error al crear convenio', { error: error.message });
    res.status(500).json({ success: false, data: null, message: 'Error interno del servidor' });
  }
};

// ─── PUT /convenios/:id ───────────────────────────────────────────────────────

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

    const convenio = await Convenio.findByIdAndUpdate(
      req.params.id,
      resultado.data,
      { new: true, runValidators: true }
    );

    if (!convenio) {
      return res.status(404).json({ success: false, data: null, message: 'Convenio no encontrado' });
    }

    res.status(200).json({
      success: true,
      data: convenio,
      message: 'Convenio actualizado exitosamente',
    });
  } catch (error) {
    logger.error('Error al actualizar convenio', { error: error.message });
    res.status(500).json({ success: false, data: null, message: 'Error interno del servidor' });
  }
};

// ─── PATCH /convenios/:id/toggle ─────────────────────────────────────────────

exports.toggle = async (req, res) => {
  try {
    const convenio = await Convenio.findById(req.params.id);

    if (!convenio) {
      return res.status(404).json({ success: false, data: null, message: 'Convenio no encontrado' });
    }

    convenio.activo = !convenio.activo;
    await convenio.save();

    res.status(200).json({
      success: true,
      data: convenio,
      message: `Convenio ${convenio.activo ? 'activado' : 'desactivado'} exitosamente`,
    });
  } catch (error) {
    logger.error('Error al cambiar estado del convenio', { error: error.message });
    res.status(500).json({ success: false, data: null, message: 'Error interno del servidor' });
  }
};
