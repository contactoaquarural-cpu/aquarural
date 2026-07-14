require('dotenv').config();
const mongoose = require('mongoose');
const Asociado = require('../models/Asociado');
const Aporte   = require('../models/Aporte');
const logger   = require('./logger');

const MONTO_MENSUAL = Number(process.env.MONTO_APORTE_MENSUAL) || 50000;

// Genera los meses desde enero del año actual hasta el mes actual (inclusive)
function getMesesHastaAhora() {
  const hoy    = new Date();
  const año    = hoy.getFullYear();
  const mesHoy = hoy.getMonth() + 1; // 1-based

  const meses = [];
  for (let m = 1; m <= mesHoy; m++) {
    meses.push({ mes: m, año });
  }
  return meses;
}

async function seedAportes() {
  await mongoose.connect(process.env.MONGODB_URI);
  logger.info('Conectado a MongoDB — iniciando seed de aportes');

  const asociados = await Asociado.find().select('_id nombre estado');

  if (asociados.length === 0) {
    logger.warn('No hay asociados en la base de datos. Registra asociados primero.');
    await mongoose.disconnect();
    return;
  }

  const meses = getMesesHastaAhora();

  if (meses.length === 0) {
    logger.warn('Estamos en enero — no hay meses anteriores para crear aportes.');
    await mongoose.disconnect();
    return;
  }

  let creados  = 0;
  let saltados = 0;

  for (const asociado of asociados) {
    for (const { mes, año } of meses) {
      const existe = await Aporte.findOne({ asociadoId: asociado._id, mes, año });
      if (existe) {
        saltados++;
        continue;
      }

      await Aporte.create({
        asociadoId: asociado._id,
        mes,
        año,
        monto:  MONTO_MENSUAL,
        estado: 'PENDIENTE',
      });

      creados++;
      logger.info(`Aporte creado: ${asociado.nombre} — ${mes}/${año} PENDIENTE`);
    }
  }

  logger.info(`Seed completado — creados: ${creados}, saltados (ya existían): ${saltados}`);
  await mongoose.disconnect();
}

seedAportes().catch((err) => {
  logger.error('Error en seed de aportes', { error: err.message });
  process.exit(1);
});
