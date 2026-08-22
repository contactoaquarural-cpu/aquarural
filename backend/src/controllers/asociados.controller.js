const xlsx = require('xlsx');
const Asociado = require('../models/Asociado');
const { ok, fail, asyncHandler } = require('../utils/response');

const puedeVerAsociado = (req, asociado) =>
  req.user.rol !== 'ASOCIADO' || req.user._id === asociado._id.toString();

const listar = asyncHandler(async (req, res) => {
  const { q, estadoServicio, estadoMoratorio, page = 1, limit = 20 } = req.query;

  const filtro = { acueductoId: req.acueductoId };
  if (estadoServicio) filtro.estadoServicio = estadoServicio;
  if (estadoMoratorio) filtro.estadoMoratorio = estadoMoratorio;
  if (q) {
    filtro.$or = [
      { nombres: { $regex: q, $options: 'i' } },
      { apellidos: { $regex: q, $options: 'i' } },
      { cedula: { $regex: q, $options: 'i' } },
      { matricula: { $regex: q, $options: 'i' } },
    ];
  }

  const pageNum = Number(page);
  const limitNum = Number(limit);

  const [asociados, total] = await Promise.all([
    Asociado.find(filtro)
      .sort('nombres')
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    Asociado.countDocuments(filtro),
  ]);

  return ok(res, { asociados, total, page: pageNum, limit: limitNum });
});

const obtener = asyncHandler(async (req, res) => {
  const asociado = await Asociado.findOne({ _id: req.params.id, acueductoId: req.acueductoId });
  if (!asociado) return fail(res, 404, 'Asociado no encontrado.');
  if (!puedeVerAsociado(req, asociado)) return fail(res, 403, 'No tienes permiso para ver este asociado.');
  return ok(res, asociado);
});

const crear = asyncHandler(async (req, res) => {
  const existente = await Asociado.findOne({ acueductoId: req.acueductoId, cedula: req.body.cedula });
  if (existente) return fail(res, 409, 'Ya existe un asociado con esa cédula en este acueducto.');

  const asociado = await Asociado.create({ ...req.body, acueductoId: req.acueductoId });
  return ok(res, asociado, 'Asociado creado.', 201);
});

const actualizar = asyncHandler(async (req, res) => {
  const asociado = await Asociado.findOneAndUpdate(
    { _id: req.params.id, acueductoId: req.acueductoId },
    req.body,
    { new: true, runValidators: true }
  );
  if (!asociado) return fail(res, 404, 'Asociado no encontrado.');
  return ok(res, asociado, 'Asociado actualizado.');
});

const eliminar = asyncHandler(async (req, res) => {
  const asociado = await Asociado.findOneAndDelete({ _id: req.params.id, acueductoId: req.acueductoId });
  if (!asociado) return fail(res, 404, 'Asociado no encontrado.');
  return ok(res, null, 'Asociado eliminado.');
});

const COLUMNAS_EXCEL = ['matricula', 'cedula', 'nombres', 'apellidos', 'telefono', 'correo', 'direccion', 'vereda', 'numeroMedidor'];

const cargarExcel = asyncHandler(async (req, res) => {
  if (!req.file) return fail(res, 400, 'Debes adjuntar un archivo Excel.');

  const libro = xlsx.read(req.file.buffer, { type: 'buffer' });
  const hoja = libro.Sheets[libro.SheetNames[0]];
  const filas = xlsx.utils.sheet_to_json(hoja, { defval: '' });

  const resultado = { creados: 0, omitidos: 0, errores: [] };

  for (const [index, fila] of filas.entries()) {
    const datos = {};
    for (const col of COLUMNAS_EXCEL) {
      if (fila[col] !== undefined && fila[col] !== '') datos[col] = String(fila[col]).trim();
    }

    if (!datos.cedula || !datos.matricula || !datos.nombres) {
      resultado.errores.push({ fila: index + 2, motivo: 'Faltan campos requeridos (matricula, cedula, nombres).' });
      continue;
    }

    const existente = await Asociado.findOne({ acueductoId: req.acueductoId, cedula: datos.cedula });
    if (existente) {
      resultado.omitidos += 1;
      continue;
    }

    try {
      await Asociado.create({ ...datos, acueductoId: req.acueductoId });
      resultado.creados += 1;
    } catch (error) {
      resultado.errores.push({ fila: index + 2, motivo: error.message });
    }
  }

  return ok(res, resultado, 'Carga masiva procesada.');
});

module.exports = { listar, obtener, crear, actualizar, eliminar, cargarExcel };
