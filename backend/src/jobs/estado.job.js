const cron = require('node-cron');
const Asociado = require('../models/Asociado');
const Aporte = require('../models/Aporte');
const Notificacion = require('../models/Notificacion');
const { enviarNotificacion } = require('../services/firebase.service');
const logger = require('../utils/logger');

// Retorna los últimos N meses (sin incluir el mes actual)
function getMesesAnteriores(n) {
  const meses = [];
  const hoy = new Date();
  let mes = hoy.getMonth() + 1; // 1-12
  let año = hoy.getFullYear();

  for (let i = 0; i < n; i++) {
    mes--;
    if (mes === 0) { mes = 12; año--; }
    meses.push({ mes, año });
  }
  return meses;
}

// Cuenta meses consecutivos (desde el más reciente) sin aporte PAGADO
async function calcularMesesSinPagar(asociadoId) {
  const ultimos3 = getMesesAnteriores(3);

  const pagados = await Aporte.find({
    asociadoId,
    estado: 'PAGADO',
    $or: ultimos3.map(m => ({ mes: m.mes, año: m.año })),
  }).select('mes año');

  const pagadosSet = new Set(pagados.map(a => `${a.año}-${a.mes}`));

  let consecutivos = 0;
  for (const { mes, año } of ultimos3) {
    if (!pagadosSet.has(`${año}-${mes}`)) consecutivos++;
    else break;
  }
  return consecutivos;
}

// Lógica principal del job
async function ejecutarJobEstado() {
  logger.info('Job de estado iniciado');
  let actualizados = 0;
  let notificados = 0;

  try {
    // Procesar todos los asociados activos (AL_DIA o EN_MORA)
    // Los INACTIVO también se procesan por si ya regularizaron su situación
    const asociados = await Asociado.find({}).select('_id nombre estado fcmToken');

    for (const asociado of asociados) {
      try {
        const mesesSinPagar = await calcularMesesSinPagar(asociado._id);

        let nuevoEstado;
        if (mesesSinPagar === 0) nuevoEstado = 'AL_DIA';
        else if (mesesSinPagar < 3) nuevoEstado = 'EN_MORA';
        else nuevoEstado = 'INACTIVO';

        if (nuevoEstado === asociado.estado) continue;

        await Asociado.findByIdAndUpdate(asociado._id, { estado: nuevoEstado });
        actualizados++;

        // Si pasa a EN_MORA: crear notificación y enviar push
        if (nuevoEstado === 'EN_MORA' && asociado.estado === 'AL_DIA') {
          const titulo = 'Aporte pendiente';
          const mensaje = `Hola ${asociado.nombre}, tienes ${mesesSinPagar} mes(es) sin pagar. Regulariza tu situación para mantener los beneficios.`;

          await Notificacion.create({
            asociadoId: asociado._id,
            titulo,
            mensaje,
            tipo: 'MORA',
          });

          await enviarNotificacion(asociado.fcmToken, titulo, mensaje);
          notificados++;
        }

        // Si pasa a INACTIVO: crear notificación informativa
        if (nuevoEstado === 'INACTIVO') {
          await Notificacion.create({
            asociadoId: asociado._id,
            titulo: 'Cuenta suspendida',
            mensaje: `Tu cuenta fue suspendida por ${mesesSinPagar} meses sin pagar. Contacta con la asociación.`,
            tipo: 'MORA',
          });
        }
      } catch (errorAsociado) {
        logger.error('Error procesando asociado en job de estado', {
          asociadoId: asociado._id,
          error: errorAsociado.message,
        });
      }
    }

    logger.info('Job de estado completado', { actualizados, notificados });
  } catch (error) {
    logger.error('Error crítico en job de estado', { error: error.message });
  }
}

// Registrar el cron job: cada día a las 6:00 AM
const iniciarJob = () => {
  cron.schedule('0 6 * * *', ejecutarJobEstado, {
    timezone: 'America/Bogota',
  });
  logger.info('Job de estado registrado — ejecuta diariamente a las 6:00 AM (Bogotá)');
};

module.exports = { iniciarJob, ejecutarJobEstado };
