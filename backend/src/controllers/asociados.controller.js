const xlsx = require('xlsx');
const Asociado = require('../models/Asociado');
const Factura = require('../models/Factura');
const LecturaHistorica = require('../models/LecturaHistorica');
const AdminUser = require('../models/AdminUser');
const { ok, fail, asyncHandler } = require('../utils/response');
const { periodoActualBogota, periodoBogota } = require('../utils/fecha.utils');

const puedeVerAsociado = (req, asociado) =>
  req.user.rol !== 'ASOCIADO' || req.user._id === asociado._id.toString();

// Un FONTANERO con veredasAsignadas solo debe ver/trabajar el padrón de esas
// veredas — sin asignación (array vacío, caso por defecto), ve todo el
// acueducto, igual que antes de que existiera esta asignación. Se consulta
// en cada request (no se guarda en el JWT) para que un cambio de asignación
// se refleje de inmediato, sin esperar a que el fontanero vuelva a loguear.
const filtroVeredaFontanero = async (req) => {
  if (req.user.rol !== 'FONTANERO') return {};
  const admin = await AdminUser.findById(req.user._id).select('veredasAsignadas');
  return admin?.veredasAsignadas?.length ? { vereda: { $in: admin.veredasAsignadas } } : {};
};

// Consecutivo real por acueducto (MAT-0001, MAT-0002, ...), calculado en el
// backend a partir del máximo existente con este formato — nunca en el
// frontend contando filas visibles, que se desincroniza en cuanto se filtra
// la tabla o se borra un asociado de en medio.
const generarSiguienteMatricula = async (acueductoId) => {
  const ultimo = await Asociado.findOne({ acueductoId, matricula: /^MAT-\d{4,}$/ })
    .sort({ matricula: -1 })
    .collation({ locale: 'en_US', numericOrdering: true });
  const siguiente = ultimo ? Number(ultimo.matricula.split('-')[1]) + 1 : 1;
  return `MAT-${String(siguiente).padStart(4, '0')}`;
};

const listar = asyncHandler(async (req, res) => {
  const { q, estadoServicio, estadoMoratorio, tieneGPS, incluirFacturadoPeriodo, page = 1, limit = 20 } = req.query;

  const filtro = { acueductoId: req.acueductoId, ...(await filtroVeredaFontanero(req)) };
  if (estadoServicio) filtro.estadoServicio = estadoServicio;
  if (estadoMoratorio) filtro.estadoMoratorio = estadoMoratorio;
  // Filtro real en Mongo (no en el cliente) — necesario para acueductos
  // grandes: traer los 2000 asociados al navegador solo para descartar la
  // mayoría en un .filter() no escala. "true" = tiene latitud Y longitud
  // numéricas; "false" = le falta al menos una de las dos.
  if (tieneGPS === 'true') {
    filtro.latitud = { $type: 'number' };
    filtro.longitud = { $type: 'number' };
  } else if (tieneGPS === 'false') {
    filtro.$or = [{ latitud: { $not: { $type: 'number' } } }, { longitud: { $not: { $type: 'number' } } }];
  }
  if (q) {
    // Si tieneGPS ya usó $or para su propia condición, la búsqueda de texto
    // no puede pisarlo con otro $or — se combina con $and para que ambas
    // condiciones apliquen a la vez, no que una reemplace a la otra.
    const condicionTexto = {
      $or: [
        { nombres: { $regex: q, $options: 'i' } },
        { apellidos: { $regex: q, $options: 'i' } },
        { cedula: { $regex: q, $options: 'i' } },
        { matricula: { $regex: q, $options: 'i' } },
      ],
    };
    if (filtro.$or) {
      filtro.$and = [{ $or: filtro.$or }, condicionTexto];
      delete filtro.$or;
    } else {
      Object.assign(filtro, condicionTexto);
    }
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

  // Marca qué asociados ya tienen factura (no anulada) del periodo vigente,
  // para que /lecturas pueda bloquear la edición de su lectura sin tener
  // que consultar Facturas por separado.
  let asociadosConFlag = asociados;
  if (incluirFacturadoPeriodo) {
    const periodo = periodoActualBogota();
    const facturas = await Factura.find({
      acueductoId: req.acueductoId,
      periodo,
      estado: { $ne: 'ANULADA' },
    }).select('asociadoId');
    const idsFacturados = new Set(facturas.map((f) => f.asociadoId.toString()));
    asociadosConFlag = asociados.map((a) => {
      const obj = a.toObject();
      obj.periodoFacturado = idsFacturados.has(a._id.toString());
      return obj;
    });
  }

  return ok(res, { asociados: asociadosConFlag, total, page: pageNum, limit: limitNum });
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

  // Reintenta una vez si dos altas concurrentes calculan el mismo siguiente
  // consecutivo — el índice único {acueductoId, matricula} lo detecta como
  // error 11000 antes de que pueda quedar una matrícula duplicada.
  for (let intento = 0; intento < 2; intento++) {
    const matricula = req.body.matricula || (await generarSiguienteMatricula(req.acueductoId));
    try {
      const asociado = await Asociado.create({ ...req.body, matricula, acueductoId: req.acueductoId });
      return ok(res, asociado, 'Asociado creado.', 201);
    } catch (error) {
      if (error.code === 11000 && !req.body.matricula && intento === 0) continue;
      throw error;
    }
  }
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

const COLUMNAS_EXCEL = ['matricula', 'cedula', 'nombres', 'apellidos', 'telefono', 'correo', 'direccion', 'vereda', 'numeroMedidor', 'lecturaInicial'];

// Lee el archivo y clasifica cada fila (CREAR / OMITIR por cédula duplicada /
// ERROR por campos faltantes), sin tocar la base de datos — usado tanto por
// la previsualización como, tras confirmar, por la carga real.
const analizarFilasExcel = async (buffer, acueductoId) => {
  const libro = xlsx.read(buffer, { type: 'buffer' });
  const hoja = libro.Sheets[libro.SheetNames[0]];
  const filas = xlsx.utils.sheet_to_json(hoja, { defval: '' });

  const analizadas = [];
  for (const [index, fila] of filas.entries()) {
    const datos = {};
    for (const col of COLUMNAS_EXCEL) {
      if (fila[col] !== undefined && fila[col] !== '') datos[col] = String(fila[col]).trim();
    }

    const numeroFila = index + 2;

    if (!datos.cedula || !datos.nombres) {
      analizadas.push({ fila: numeroFila, datos, accion: 'ERROR', motivo: 'Faltan campos requeridos (cedula, nombres).' });
      continue;
    }

    const existente = await Asociado.findOne({ acueductoId, cedula: datos.cedula }).select('nombres');
    if (existente) {
      analizadas.push({ fila: numeroFila, datos, accion: 'OMITIR', motivo: `Ya existe un suscriptor con esa cédula (${existente.nombres}).` });
      continue;
    }

    // "lecturaInicial" es la lectura de arranque de un medidor YA instalado
    // (no nuevo) — igual concepto que el modal manual. Sin esta columna, un
    // medidor con consumo previo real quedaría guardado en 0 como si fuera
    // nuevo (mismo bug histórico ya corregido en el alta manual, ver
    // PLAN_DE_TRABAJO.md). Vacía o "0" = medidor nuevo, arranca en 0.
    const tieneMedidor = Boolean(datos.numeroMedidor) && datos.numeroMedidor !== 'S/N';
    const lecturaInicialNum = tieneMedidor ? Number(datos.lecturaInicial) || 0 : 0;
    delete datos.lecturaInicial;
    datos.lecturaAnterior = lecturaInicialNum;
    datos.lecturaActual = lecturaInicialNum;

    analizadas.push({ fila: numeroFila, datos, accion: 'CREAR' });
  }
  return analizadas;
};

// Previsualiza el archivo sin crear nada — el admin revisa fila por fila
// antes de confirmar (ver CargaMasivaPage.jsx en el frontend).
const previsualizarExcel = asyncHandler(async (req, res) => {
  if (!req.file) return fail(res, 400, 'Debes adjuntar un archivo Excel.');
  const analizadas = await analizarFilasExcel(req.file.buffer, req.acueductoId);
  return ok(res, { filas: analizadas });
});

const cargarExcel = asyncHandler(async (req, res) => {
  if (!req.file) return fail(res, 400, 'Debes adjuntar un archivo Excel.');

  const analizadas = await analizarFilasExcel(req.file.buffer, req.acueductoId);
  const resultado = { creados: 0, omitidos: 0, errores: [] };

  for (const item of analizadas) {
    if (item.accion === 'ERROR') {
      resultado.errores.push({ fila: item.fila, motivo: item.motivo });
      continue;
    }
    if (item.accion === 'OMITIR') {
      resultado.omitidos += 1;
      continue;
    }

    try {
      // Igual que en el alta manual: si la fila no trae matrícula, se asigna
      // el siguiente consecutivo del acueducto en vez de exigirla en el Excel.
      const matricula = item.datos.matricula || (await generarSiguienteMatricula(req.acueductoId));
      await Asociado.create({ ...item.datos, matricula, acueductoId: req.acueductoId });
      resultado.creados += 1;
    } catch (error) {
      resultado.errores.push({ fila: item.fila, motivo: error.message });
    }
  }

  return ok(res, resultado, 'Carga masiva procesada.');
});

// Registra la lectura del medidor de varios asociados a la vez. La lectura
// actual anterior pasa a ser "lecturaAnterior" del nuevo ciclo, para que el
// próximo consumo se calcule contra este valor. Cada lectura además queda
// guardada en LecturaHistorica (un registro por asociado por mes), para que
// tanto el asociado como el admin puedan consultar el histórico de consumo
// en caso de reclamos, independientemente de si el mes llegó a facturarse.
const registrarLecturasMasivas = asyncHandler(async (req, res) => {
  const { lecturas } = req.body;
  const periodo = periodoActualBogota();

  const resultado = { actualizados: 0, errores: [] };

  for (const { asociadoId, lecturaActual } of lecturas) {
    const asociado = await Asociado.findOne({ _id: asociadoId, acueductoId: req.acueductoId });
    if (!asociado) {
      resultado.errores.push({ asociadoId, motivo: 'Asociado no encontrado.' });
      continue;
    }

    if (lecturaActual < asociado.lecturaActual) {
      resultado.errores.push({ asociadoId, motivo: 'La lectura no puede ser menor que la anterior registrada.' });
      continue;
    }

    const facturaDelPeriodo = await Factura.findOne({
      acueductoId: req.acueductoId,
      asociadoId,
      periodo,
      estado: { $ne: 'ANULADA' },
    });
    if (facturaDelPeriodo) {
      resultado.errores.push({
        asociadoId,
        motivo: 'Ya se generó la factura de este periodo. Anula el periodo en Facturación antes de corregir la lectura.',
      });
      continue;
    }

    const lecturaAnterior = asociado.lecturaActual;

    asociado.lecturaAnterior = lecturaAnterior;
    asociado.lecturaActual = lecturaActual;
    asociado.fechaUltimaLectura = new Date();
    await asociado.save();

    await LecturaHistorica.findOneAndUpdate(
      { acueductoId: req.acueductoId, asociadoId, periodo },
      {
        acueductoId: req.acueductoId,
        asociadoId,
        periodo,
        lecturaAnterior,
        lecturaActual,
        consumoM3: Math.max(0, lecturaActual - lecturaAnterior),
        fechaRegistro: new Date(),
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    resultado.actualizados += 1;
  }

  return ok(res, resultado, 'Lecturas registradas.');
});

// Guarda el GPS del predio capturado en campo por el fontanero. Endpoint
// propio (no el PUT general de actualizar, que es solo de verifyAdmin) para
// que el fontanero pueda fijar la ubicación sin depender de haber cargado
// también una lectura de medidor ese mismo ciclo.
const actualizarGps = asyncHandler(async (req, res) => {
  const { latitud, longitud } = req.body;
  const asociado = await Asociado.findOne({ _id: req.params.id, acueductoId: req.acueductoId });
  if (!asociado) return fail(res, 404, 'Asociado no encontrado.');

  asociado.latitud = latitud;
  asociado.longitud = longitud;
  await asociado.save();

  return ok(res, { latitud, longitud }, 'Ubicación GPS actualizada.');
});

// Guarda el GPS del propio predio, capturado por el suscriptor desde la app
// móvil. Ruta separada de actualizarGps (fontanero) a propósito: aquí el
// permiso está acotado a "solo mi propio registro" (verificado con
// req.user._id), mientras que verifyFontanero permite editar cualquier
// asociado del acueducto — mezclar ambos casos en un único endpoint abriría
// la puerta a que un bug de middleware deje a un suscriptor editar el GPS
// de otro.
const actualizarGpsPropio = asyncHandler(async (req, res) => {
  const { latitud, longitud } = req.body;
  if (req.params.id !== req.user._id) return fail(res, 403, 'Solo puedes actualizar tu propia ubicación.');

  const asociado = await Asociado.findOne({ _id: req.params.id, acueductoId: req.acueductoId });
  if (!asociado) return fail(res, 404, 'Asociado no encontrado.');

  asociado.latitud = latitud;
  asociado.longitud = longitud;
  await asociado.save();

  return ok(res, { latitud, longitud }, 'Ubicación GPS actualizada.');
});

// Permite al propio suscriptor actualizar solo un subconjunto acotado de sus
// datos de contacto (teléfono, correo, dirección) desde la app móvil — nunca
// cédula, nombres, matrícula, vereda ni medidor, que son administrativos y
// solo el PUT general (verifyAdmin) puede tocar. El validator ya restringe
// qué campos llegan aquí (actualizarPerfilPropioSchema), pero se reafirma
// explícitamente al construir el objeto de cambios, para que agregar un
// campo nuevo al validator sin querer no abra una puerta de escritura extra.
const actualizarPerfilPropio = asyncHandler(async (req, res) => {
  if (req.params.id !== req.user._id) return fail(res, 403, 'Solo puedes actualizar tu propio perfil.');

  const asociado = await Asociado.findOne({ _id: req.params.id, acueductoId: req.acueductoId });
  if (!asociado) return fail(res, 404, 'Asociado no encontrado.');

  const { telefono, correo, direccion } = req.body;
  if (telefono !== undefined) asociado.telefono = telefono;
  if (correo !== undefined) asociado.correo = correo;
  if (direccion !== undefined) asociado.direccion = direccion;
  await asociado.save();

  return ok(res, asociado, 'Perfil actualizado.');
});

// Guarda el token de Firebase Cloud Messaging del dispositivo del propio
// suscriptor, para que pueda recibir push (nuevas convocatorias, avisos de
// mora, etc. — ver eventos.controller.js). Se llama cada vez que la app
// abre sesión o el token rota (los tokens FCM pueden cambiar), así que
// simplemente sobreescribe sin validar duplicados entre asociados.
const actualizarTokenFCM = asyncHandler(async (req, res) => {
  if (req.params.id !== req.user._id) return fail(res, 403, 'Solo puedes actualizar tu propio token.');

  const asociado = await Asociado.findOne({ _id: req.params.id, acueductoId: req.acueductoId });
  if (!asociado) return fail(res, 404, 'Asociado no encontrado.');

  asociado.tokenFCM = req.body.tokenFCM;
  await asociado.save();

  return ok(res, null, 'Token de notificaciones actualizado.');
});

// Historial de consumo de un asociado (todas sus lecturas mensuales
// registradas), para reclamos o consulta del propio asociado en la app.
const historialConsumo = asyncHandler(async (req, res) => {
  const asociado = await Asociado.findOne({ _id: req.params.id, acueductoId: req.acueductoId });
  if (!asociado) return fail(res, 404, 'Asociado no encontrado.');
  if (!puedeVerAsociado(req, asociado)) return fail(res, 403, 'No tienes permiso para ver este historial.');

  const historial = await LecturaHistorica.find({ acueductoId: req.acueductoId, asociadoId: req.params.id }).sort(
    '-periodo'
  );

  return ok(res, historial);
});

const tieneMedidorReal = (asociado) => Boolean(asociado.numeroMedidor) && asociado.numeroMedidor !== 'S/N';

// Métricas del ciclo vigente de lecturas para el fontanero: cuántos predios
// con medidor ya tienen lectura este mes, cuántos faltan, y el listado de
// pendientes con su GPS (si lo tienen) para ubicarlos en el mapa.
const estadisticasLecturas = asyncHandler(async (req, res) => {
  const periodo = periodoActualBogota();
  const asociados = await Asociado.find({
    acueductoId: req.acueductoId,
    estadoServicio: 'ACTIVO',
    ...(await filtroVeredaFontanero(req)),
  });

  const enPeriodoVigente = (a) => a.fechaUltimaLectura && periodoBogota(a.fechaUltimaLectura) === periodo;

  const conMedidor = asociados.filter(tieneMedidorReal);
  const registradosEsteCiclo = conMedidor.filter(enPeriodoVigente);
  const pendientes = conMedidor.filter((a) => !enPeriodoVigente(a));

  const consumoTotalRegistrado = registradosEsteCiclo.reduce(
    (acc, a) => acc + Math.max(0, (a.lecturaActual || 0) - (a.lecturaAnterior || 0)),
    0
  );

  return ok(res, {
    periodo,
    totalConMedidor: conMedidor.length,
    registrados: registradosEsteCiclo.length,
    pendientes: pendientes.length,
    porcentajeAvance: conMedidor.length > 0 ? Math.round((registradosEsteCiclo.length / conMedidor.length) * 100) : 0,
    consumoTotalRegistrado,
    prediosPendientes: pendientes.map((a) => ({
      _id: a._id,
      nombres: a.nombres,
      apellidos: a.apellidos,
      matricula: a.matricula,
      vereda: a.vereda,
      direccion: a.direccion,
      numeroMedidor: a.numeroMedidor,
      latitud: a.latitud,
      longitud: a.longitud,
    })),
  });
});

module.exports = {
  listar,
  obtener,
  crear,
  actualizar,
  eliminar,
  cargarExcel,
  previsualizarExcel,
  registrarLecturasMasivas,
  actualizarGps,
  actualizarGpsPropio,
  actualizarPerfilPropio,
  actualizarTokenFCM,
  historialConsumo,
  estadisticasLecturas,
};
