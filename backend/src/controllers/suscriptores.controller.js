const Suscriptor = require('../models/Suscriptor');
const xlsx = require('xlsx');

/**
 * Crear un suscriptor de forma individual
 */
const crearSuscriptor = async (req, res) => {
  try {
    const acueductoId = req.acueductoId;
    const {
      matricula,
      cedula,
      nombres,
      apellidos,
      telefono,
      correo,
      vereda,
      direccion,
      numeroMedidor,
      latitud,
      longitud,
      tipoTarifa,
      tarifaPersonalizada,
    } = req.body;

    const existeMatricula = await Suscriptor.findOne({ acueductoId, matricula });
    if (existeMatricula) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Ya existe un suscriptor registrado con esta matrícula en su acueducto.',
      });
    }

    const nuevoSuscriptor = new Suscriptor({
      acueductoId,
      matricula,
      cedula,
      nombres,
      apellidos: apellidos || '',
      telefono,
      correo,
      vereda: vereda || 'Centro Veredal',
      direccion,
      numeroMedidor: numeroMedidor || 'S/N',
      latitud: latitud || null,
      longitud: longitud || null,
      tipoTarifa: tipoTarifa || 'GENERAL',
      tarifaPersonalizada: tarifaPersonalizada || null,
    });

    await nuevoSuscriptor.save();

    res.status(201).json({
      ok: true,
      mensaje: 'Suscriptor registrado correctamente.',
      suscriptor: nuevoSuscriptor,
    });
  } catch (error) {
    console.error('Error en crearSuscriptor:', error);
    res.status(500).json({
      ok: false,
      mensaje: 'Error interno al registrar el suscriptor.',
    });
  }
};

/**
 * Obtener suscriptores del acueducto con búsqueda y filtros
 */
const obtenerSuscriptores = async (req, res) => {
  try {
    const acueductoId = req.acueductoId;
    const { buscar, vereda, estadoMoratorio, page = 1, limit = 50 } = req.query;

    const query = { acueductoId };

    if (vereda) {
      query.vereda = vereda;
    }
    if (estadoMoratorio) {
      query.estadoMoratorio = estadoMoratorio;
    }

    if (buscar) {
      const regex = new RegExp(buscar, 'i');
      query.$or = [
        { nombres: regex },
        { apellidos: regex },
        { cedula: regex },
        { matricula: regex },
        { numeroMedidor: regex },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [total, suscriptores] = await Promise.all([
      Suscriptor.countDocuments(query),
      Suscriptor.find(query).sort({ nombres: 1 }).skip(skip).limit(parseInt(limit)),
    ]);

    res.json({
      ok: true,
      total,
      pagina: parseInt(page),
      paginasTotal: Math.ceil(total / parseInt(limit)),
      suscriptores,
    });
  } catch (error) {
    console.error('Error en obtenerSuscriptores:', error);
    res.status(500).json({
      ok: false,
      mensaje: 'Error al consultar los suscriptores.',
    });
  }
};

/**
 * Actualizar coordenadas GPS de la vivienda/predio del suscriptor
 */
const actualizarUbicacionGPS = async (req, res) => {
  try {
    const { id } = req.params;
    const { latitud, longitud } = req.body;

    if (latitud === undefined || longitud === undefined) {
      return res.status(400).json({
        ok: false,
        mensaje: 'La latitud y longitud son obligatorias.',
      });
    }

    const suscriptor = await Suscriptor.findByIdAndUpdate(
      id,
      { latitud: parseFloat(latitud), longitud: parseFloat(longitud) },
      { new: true }
    );

    if (!suscriptor) {
      return res.status(444).json({ ok: false, mensaje: 'Suscriptor no encontrado.' });
    }

    res.json({
      ok: true,
      mensaje: 'Ubicación GPS actualizada correctamente.',
      suscriptor,
    });
  } catch (error) {
    console.error('Error en actualizarUbicacionGPS:', error);
    res.status(500).json({
      ok: false,
      mensaje: 'Error al actualizar la ubicación GPS.',
    });
  }
};

/**
 * Carga masiva de suscriptores desde un archivo Excel (.xlsx)
 */
const cargarMasivaExcel = async (req, res) => {
  try {
    const acueductoId = req.acueductoId;

    if (!req.file) {
      return res.status(400).json({
        ok: false,
        mensaje: 'No se subió ningún archivo Excel (.xlsx)',
      });
    }

    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    if (!sheetData || sheetData.length === 0) {
      return res.status(400).json({
        ok: false,
        mensaje: 'El archivo Excel está vacío.',
      });
    }

    const procesados = [];
    const errores = [];

    for (let i = 0; i < sheetData.length; i++) {
      const fila = sheetData[i];
      const numeroFila = i + 2; // Fila 1 es encabezado

      const matricula = fila.Matricula || fila.MATRICULA || fila.Cuenta || fila.CUENTA;
      const cedula = fila.Cedula || fila.CEDULA || fila.Documento || fila.DOCUMENTO;
      const nombres = fila.Nombres || fila.NOMBRES || fila.Nombre || fila.NOMBRE;
      const apellidos = fila.Apellidos || fila.APELLIDOS || '';
      const telefono = fila.Telefono || fila.TELEFONO || fila.Celular || '';
      const vereda = fila.Vereda || fila.VEREDA || 'Centro Veredal';
      const medidor = fila.Medidor || fila.MEDIDOR || 'S/N';

      if (!matricula || !cedula || !nombres) {
        errores.push({
          fila: numeroFila,
          motivo: 'Faltan campos obligatorios (Matrícula, Cédula o Nombres)',
        });
        continue;
      }

      const existe = await Suscriptor.findOne({ acueductoId, matricula: String(matricula).trim() });
      if (existe) {
        errores.push({
          fila: numeroFila,
          matricula: String(matricula),
          motivo: 'La matrícula ya existe en la base de datos',
        });
        continue;
      }

      procesados.push({
        acueductoId,
        matricula: String(matricula).trim(),
        cedula: String(cedula).trim(),
        nombres: String(nombres).trim(),
        apellidos: String(apellidos).trim(),
        telefono: String(telefono).trim(),
        vereda: String(vereda).trim(),
        numeroMedidor: String(medidor).trim(),
      });
    }

    if (procesados.length > 0) {
      await Suscriptor.insertMany(procesados);
    }

    res.json({
      ok: true,
      totalProcesados: procesados.length,
      totalErrores: errores.length,
      errores,
      mensaje: `Carga masiva completada: ${procesados.length} creados, ${errores.length} omitidos/con error.`,
    });
  } catch (error) {
    console.error('Error en cargarMasivaExcel:', error);
    res.status(500).json({
      ok: false,
      mensaje: 'Error procesando la carga masiva en Excel.',
    });
  }
};

module.exports = {
  crearSuscriptor,
  obtenerSuscriptores,
  actualizarUbicacionGPS,
  cargarMasivaExcel,
};
