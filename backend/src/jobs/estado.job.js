const cron = require('node-cron');
const Asociado = require('../models/Asociado');
const Aporte = require('../models/Aporte');
const Notificacion = require('../models/Notificacion');
const Configuracion = require('../models/Configuracion');
const { enviarNotificacion } = require('../services/firebase.service');
const logger = require('../utils/logger');

// Retorna los últimos N meses (sin incluir el mes actual)
function getMesesAnteriores(n) {
  const meses = [];
  const hoy = new Date();
  let mes = hoy.getMonth() + 1;
  let año = hoy.getFullYear();

  for (let i = 0; i < n; i++) {
    mes--;
    if (mes === 0) { mes = 12; año--; }
    meses.push({ mes, año });
  }
  return meses;
}

// Último día del mes dado
function ultimoDiaDelMes(año, mes) {
  return new Date(año, mes, 0); // mes en Date es 0-based, así que mes=4 → último día de marzo
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

// ─── JOB 1: Crear aportes pendientes del mes anterior (día 1 de cada mes) ────

async function ejecutarJobCrearAportes() {
  const hoy = new Date();
  let mes = hoy.getMonth() + 1;
  let año = hoy.getFullYear();

  logger.info('Job crear aportes iniciado', { mes, año });
  let creados = 0;

  try {
    const config = await Configuracion.obtener();
    const MONTO_MENSUAL = config.montoAporte;

    const asociados = await Asociado.find({
      estado: { $in: ['AL_DIA', 'EN_MORA'] },
    }).select('_id nombre');

    for (const asociado of asociados) {
      try {
        const existe = await Aporte.findOne({ asociadoId: asociado._id, mes, año });
        if (existe) continue;

        await Aporte.create({
          asociadoId: asociado._id,
          mes,
          año,
          monto: MONTO_MENSUAL,
          estado: 'PENDIENTE',
        });
        creados++;
      } catch (err) {
        logger.error('Error creando aporte para asociado', {
          asociadoId: asociado._id,
          error: err.message,
        });
      }
    }

    logger.info('Job crear aportes completado', { creados, mes, año });
  } catch (error) {
    logger.error('Error crítico en job crear aportes', { error: error.message });
  }
}

// ─── JOB 2: Actualizar estados y enviar recordatorios (diario a las 6 AM) ────

async function ejecutarJobEstado() {
  logger.info('Job de estado iniciado');
  let actualizados = 0;
  let notificados  = 0;

  const hoy        = new Date();
  const diaDelMes  = hoy.getDate();
  const mesActual  = hoy.getMonth() + 1;
  const añoActual  = hoy.getFullYear();
  const vencimiento = ultimoDiaDelMes(añoActual, mesActual);
  const diasRestantes = Math.ceil((vencimiento - hoy) / (1000 * 60 * 60 * 24));

  try {
    const asociados = await Asociado.find({}).select('_id nombre estado fcmToken');

    for (const asociado of asociados) {
      try {
        // ── Cambio de estado ──────────────────────────────────────────────────
        const mesesSinPagar = await calcularMesesSinPagar(asociado._id);

        let nuevoEstado;
        if (mesesSinPagar === 0)      nuevoEstado = 'AL_DIA';
        else if (mesesSinPagar < 3)   nuevoEstado = 'EN_MORA';
        else                          nuevoEstado = 'INACTIVO';

        if (nuevoEstado !== asociado.estado) {
          await Asociado.findByIdAndUpdate(asociado._id, { estado: nuevoEstado });
          actualizados++;

          if (nuevoEstado === 'EN_MORA' && asociado.estado === 'AL_DIA') {
            const titulo  = 'Aporte pendiente';
            const mensaje = `Hola ${asociado.nombre}, tienes ${mesesSinPagar} mes(es) sin pagar. Regulariza tu situación para mantener tus beneficios.`;

            await Notificacion.create({ asociadoId: asociado._id, titulo, mensaje, tipo: 'MORA' });
            await enviarNotificacion(asociado.fcmToken, titulo, mensaje);
            notificados++;
          }

          if (nuevoEstado === 'INACTIVO') {
            await Notificacion.create({
              asociadoId: asociado._id,
              titulo:  'Cuenta suspendida',
              mensaje: `Tu cuenta fue suspendida por ${mesesSinPagar} meses sin pagar. Contacta con la asociación.`,
              tipo: 'MORA',
            });
          }
        }

        // ── Recordatorio 5 días antes del vencimiento ─────────────────────────
        // Envía si: quedan ≤5 días para fin de mes Y tiene aporte PENDIENTE del mes actual
        if (diasRestantes <= 5 && diasRestantes > 0) {
          const aportePendiente = await Aporte.findOne({
            asociadoId: asociado._id,
            mes:    mesActual,
            año:    añoActual,
            estado: 'PENDIENTE',
          });

          if (aportePendiente) {
            const titulo  = '⏰ Tu aporte vence pronto';
            const mensaje = `Hola ${asociado.nombre}, tu aporte de ${new Intl.DateTimeFormat('es-CO', { month: 'long' }).format(hoy)} vence en ${diasRestantes} día(s). Paga a tiempo para mantener tus beneficios.`;

            const yaNotificado = await Notificacion.findOne({
              asociadoId: asociado._id,
              tipo:       'MORA',
              createdAt:  { $gte: new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate()) },
            });

            if (!yaNotificado) {
              await Notificacion.create({ asociadoId: asociado._id, titulo, mensaje, tipo: 'MORA' });
              await enviarNotificacion(asociado.fcmToken, titulo, mensaje);
              notificados++;
            }
          }
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

// ─── Registro de crons ────────────────────────────────────────────────────────

const iniciarJob = () => {
  // Diario a las 6:00 AM — actualiza estados y envía recordatorios
  cron.schedule('0 6 * * *', ejecutarJobEstado, { timezone: 'America/Bogota' });
  logger.info('Job de estado registrado — diariamente a las 6:00 AM (Bogotá)');

  // Día 1 de cada mes a las 7:00 AM — crea aportes PENDIENTE del mes anterior
  cron.schedule('0 7 1 * *', ejecutarJobCrearAportes, { timezone: 'America/Bogota' });
  logger.info('Job crear aportes registrado — día 1 de cada mes a las 7:00 AM (Bogotá)');
};

module.exports = { iniciarJob, ejecutarJobEstado, ejecutarJobCrearAportes };
