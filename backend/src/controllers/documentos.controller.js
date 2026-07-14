const { z } = require('zod');
const Asociado = require('../models/Asociado');
const { subirDocumento, eliminarImagen } = require('../services/cloudinary.service');

const TIPOS_VALIDOS = ['VACUNACION', 'TITULO_PROPIEDAD', 'REGISTRO_ICA', 'OTRO'];

const schemaTipo = z.object({
  tipo: z.enum(['VACUNACION', 'TITULO_PROPIEDAD', 'REGISTRO_ICA', 'OTRO'], {
    errorMap: () => ({ message: 'Tipo inválido. Usa: VACUNACION, TITULO_PROPIEDAD, REGISTRO_ICA u OTRO' }),
  }),
});

// GET /documentos — obtener documentos del asociado autenticado
const listar = async (req, res) => {
  try {
    const asociado = await Asociado.findById(req.user.id).select('documentos');
    if (!asociado) return res.status(404).json({ success: false, message: 'Asociado no encontrado' });
    res.json({ success: true, data: asociado.documentos });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error al obtener documentos' });
  }
};

// GET /documentos/asociado/:id — admin: ver documentos de cualquier asociado
const listarAdmin = async (req, res) => {
  try {
    const asociado = await Asociado.findById(req.params.id).select('documentos nombre cedula');
    if (!asociado) return res.status(404).json({ success: false, message: 'Asociado no encontrado' });
    res.json({ success: true, data: asociado.documentos });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error al obtener documentos' });
  }
};

// POST /documentos — subir un documento
const subir = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No se recibió ningún archivo' });

    const parsed = schemaTipo.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, message: parsed.error.errors[0].message });
    }

    const { tipo } = parsed.data;
    const asociadoId = req.user.id;

    const asociado = await Asociado.findById(asociadoId);
    if (!asociado) return res.status(404).json({ success: false, message: 'Asociado no encontrado' });

    // Si ya existe un documento del mismo tipo, eliminar el anterior de Cloudinary
    const existente = asociado.documentos.find((d) => d.tipo === tipo);
    if (existente?.publicId) {
      await eliminarImagen(existente.publicId).catch(() => {});
      asociado.documentos = asociado.documentos.filter((d) => d.tipo !== tipo);
    }

    const folder   = `asogacentro/documentos/${asociadoId}`;
    const publicId = `${tipo.toLowerCase()}_${Date.now()}`;
    const { url, publicId: cloudinaryPublicId } = await subirDocumento(req.file.buffer, folder, publicId);

    asociado.documentos.push({ tipo, url, publicId: cloudinaryPublicId, fechaSubida: new Date() });
    await asociado.save();

    res.status(201).json({ success: true, message: 'Documento subido correctamente', data: { tipo, url } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error al subir documento' });
  }
};

// DELETE /documentos/:tipo — eliminar un documento por tipo
const eliminar = async (req, res) => {
  try {
    const tipo = req.params.tipo.toUpperCase();
    if (!TIPOS_VALIDOS.includes(tipo)) {
      return res.status(400).json({ success: false, message: 'Tipo de documento inválido' });
    }

    const asociado = await Asociado.findById(req.user.id);
    if (!asociado) return res.status(404).json({ success: false, message: 'Asociado no encontrado' });

    const doc = asociado.documentos.find((d) => d.tipo === tipo);
    if (!doc) return res.status(404).json({ success: false, message: 'Documento no encontrado' });

    if (doc.publicId) await eliminarImagen(doc.publicId).catch(() => {});
    asociado.documentos = asociado.documentos.filter((d) => d.tipo !== tipo);
    await asociado.save();

    res.json({ success: true, message: 'Documento eliminado' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error al eliminar documento' });
  }
};

module.exports = { listar, listarAdmin, subir, eliminar };
