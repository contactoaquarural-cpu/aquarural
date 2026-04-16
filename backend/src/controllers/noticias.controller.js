const { z } = require('zod');
const Noticia = require('../models/Noticia');

const noticiaSchema = z.object({
  titulo:    z.string().min(3, 'El título debe tener al menos 3 caracteres').trim(),
  contenido: z.string().min(10, 'El contenido debe tener al menos 10 caracteres').trim(),
  categoria: z.enum(['GOBIERNO', 'SANIDAD', 'PRECIOS', 'EVENTO', 'INSTITUCIONAL']).optional(),
  imagen:    z.string().url('URL de imagen inválida').optional().or(z.literal('')),
  publicado: z.boolean().optional(),
});

// GET /noticias — listar noticias publicadas (público)
exports.listar = async (req, res) => {
  try {
    const { categoria, page = 1, limit = 10 } = req.query;
    const filtro = { publicado: true };
    if (categoria) filtro.categoria = categoria;

    const skip  = (parseInt(page) - 1) * parseInt(limit);
    const total = await Noticia.countDocuments(filtro);

    const noticias = await Noticia.find(filtro)
      .sort({ fechaPublicacion: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      data:    noticias,
      message: 'Noticias obtenidas',
      pagination: {
        total,
        page:       parseInt(page),
        limit:      parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, data: null, message: 'Error interno del servidor' });
  }
};

// GET /noticias/todas — listar todas (admin, incluye no publicadas)
exports.listarTodas = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip  = (parseInt(page) - 1) * parseInt(limit);
    const total = await Noticia.countDocuments();

    const noticias = await Noticia.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      data:    noticias,
      message: 'Noticias obtenidas',
      pagination: {
        total,
        page:       parseInt(page),
        limit:      parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, data: null, message: 'Error interno del servidor' });
  }
};

// GET /noticias/:id — detalle (público)
exports.obtenerPorId = async (req, res) => {
  try {
    const noticia = await Noticia.findById(req.params.id);
    if (!noticia) {
      return res.status(404).json({ success: false, data: null, message: 'Noticia no encontrada' });
    }
    res.status(200).json({ success: true, data: noticia, message: 'Noticia obtenida' });
  } catch (error) {
    res.status(500).json({ success: false, data: null, message: 'Error interno del servidor' });
  }
};

// POST /noticias — crear (admin)
exports.crear = async (req, res) => {
  try {
    const resultado = noticiaSchema.safeParse(req.body);
    if (!resultado.success) {
      return res.status(400).json({
        success: false,
        data:    null,
        message: resultado.error.errors[0].message,
      });
    }

    const { titulo, contenido, categoria, imagen, publicado } = resultado.data;

    const noticia = await Noticia.create({
      titulo,
      contenido,
      categoria:        categoria || 'INSTITUCIONAL',
      imagen:           imagen    || undefined,
      publicado:        publicado || false,
      fechaPublicacion: publicado ? new Date() : undefined,
    });

    res.status(201).json({ success: true, data: noticia, message: 'Noticia creada exitosamente' });
  } catch (error) {
    res.status(500).json({ success: false, data: null, message: 'Error interno del servidor' });
  }
};

// PUT /noticias/:id — actualizar (admin)
exports.actualizar = async (req, res) => {
  try {
    const resultado = noticiaSchema.partial().safeParse(req.body);
    if (!resultado.success) {
      return res.status(400).json({
        success: false,
        data:    null,
        message: resultado.error.errors[0].message,
      });
    }

    const noticia = await Noticia.findById(req.params.id);
    if (!noticia) {
      return res.status(404).json({ success: false, data: null, message: 'Noticia no encontrada' });
    }

    // Si se publica por primera vez, registrar fecha
    if (resultado.data.publicado && !noticia.publicado) {
      resultado.data.fechaPublicacion = new Date();
    }

    Object.assign(noticia, resultado.data);
    await noticia.save();

    res.status(200).json({ success: true, data: noticia, message: 'Noticia actualizada' });
  } catch (error) {
    res.status(500).json({ success: false, data: null, message: 'Error interno del servidor' });
  }
};

// DELETE /noticias/:id — eliminar (admin)
exports.eliminar = async (req, res) => {
  try {
    const noticia = await Noticia.findByIdAndDelete(req.params.id);
    if (!noticia) {
      return res.status(404).json({ success: false, data: null, message: 'Noticia no encontrada' });
    }
    res.status(200).json({ success: true, data: null, message: 'Noticia eliminada' });
  } catch (error) {
    res.status(500).json({ success: false, data: null, message: 'Error interno del servidor' });
  }
};
