const cron = require('node-cron');
const Acueducto = require('../models/Acueducto');
const Asociado = require('../models/Asociado');
const Factura = require('../models/Factura');
const { generarFacturacionMasiva, recalcularEstadoMoratorio } = require('../services/facturacion.service');
const { crearNotificacion } = require('../services/notificaciones.service');
const { periodoActualBogota } = require('../utils/fecha.utils');
const logger = require('../utils/logger');

const formatMonto = (valor) => `$${Math.round(valor || 0).toLocaleString('es-CO')} COP`;

const DIAS_AVISO_VENCIMIENTO = 3;

// Recalcula estadoMoratorio de cada asociado según sus facturas vencidas
// (PENDIENTE cuya fechaVencimiento ya pasó = mora). Itera por-tenant, con
// try/catch por asociado para que un fallo no aborte al resto del acueducto.
const ejecutarJobEstado = async () => {
  const acueductos = await Acueducto.find({ estado: 'ACTIVO' });
  const hoy = new Date();

  for (const acueducto of acueductos) {
    try {
      // Facturas PENDIENTE cuya fecha de vencimiento ya pasó pasan a VENCIDA,
      // sumando el recargo por mora configurado UNA SOLA VEZ (justo al cruzar
      // a VENCIDA) — no un updateMany genérico, porque hay que sumar
      // montoRecargoMora a montoMora/montoTotal factura por factura. Al no
      // volver a tocar facturas que ya están en VENCIDA, el recargo nunca se
      // acumula día tras día en corridas posteriores del cron.
      const recargo = acueducto.montoRecargoMora || 0;
      if (recargo > 0) {
        const facturasAVencer = await Factura.find({
          acueductoId: acueducto._id,
          estado: 'PENDIENTE',
          fechaVencimiento: { $lt: hoy },
        });
        for (const factura of facturasAVencer) {
          factura.estado = 'VENCIDA';
          factura.montoMora = recargo;
          factura.montoTotal += recargo;
          await factura.save();
          await crearNotificacion(factura.asociadoId, acueducto._id, {
            tipo: 'FACTURA_VENCIDA',
            titulo: 'Factura vencida',
            cuerpo: `Tu factura de ${factura.periodo} venció y ahora incluye un recargo por mora de ${formatMonto(recargo)}. Total: ${formatMonto(factura.montoTotal)}.`,
            referenciaId: factura._id.toString(),
          });
        }
      } else {
        const facturasAVencer = await Factura.find({
          acueductoId: acueducto._id,
          estado: 'PENDIENTE',
          fechaVencimiento: { $lt: hoy },
        }).select('_id asociadoId periodo montoTotal');
        await Factura.updateMany(
          { acueductoId: acueducto._id, estado: 'PENDIENTE', fechaVencimiento: { $lt: hoy } },
          { estado: 'VENCIDA' }
        );
        for (const factura of facturasAVencer) {
          await crearNotificacion(factura.asociadoId, acueducto._id, {
            tipo: 'FACTURA_VENCIDA',
            titulo: 'Factura vencida',
            cuerpo: `Tu factura de ${factura.periodo} venció. Total: ${formatMonto(factura.montoTotal)}.`,
            referenciaId: factura._id.toString(),
          });
        }
      }

      // Recordatorio preventivo, antes de que la factura venza — hasta ahora
      // solo se avisaba DESPUÉS del vencimiento (FACTURA_VENCIDA). Se marca
      // recordatorioEnviado para no repetir el aviso cada día mientras la
      // factura siga PENDIENTE dentro de la ventana de 3 días.
      const limiteAviso = new Date(hoy);
      limiteAviso.setDate(limiteAviso.getDate() + DIAS_AVISO_VENCIMIENTO);
      const facturasPorVencer = await Factura.find({
        acueductoId: acueducto._id,
        estado: 'PENDIENTE',
        recordatorioEnviado: false,
        fechaVencimiento: { $gte: hoy, $lte: limiteAviso },
      });
      for (const factura of facturasPorVencer) {
        factura.recordatorioEnviado = true;
        await factura.save();
        await crearNotificacion(factura.asociadoId, acueducto._id, {
          tipo: 'PROXIMO_VENCIMIENTO',
          titulo: 'Tu factura vence pronto',
          cuerpo: `Tu factura de ${factura.periodo} vence el ${factura.fechaVencimiento.toLocaleDateString('es-CO')}. Total: ${formatMonto(factura.montoTotal)}.`,
          referenciaId: factura._id.toString(),
        });
      }

      const asociados = await Asociado.find({ acueductoId: acueducto._id, estadoServicio: { $ne: 'SUSPENDIDO' } });

      for (const asociado of asociados) {
        try {
          const { estadoAnterior, nuevoEstado } = await recalcularEstadoMoratorio(acueducto._id, asociado._id);
          if (nuevoEstado === 'EN_MORA' && estadoAnterior !== 'EN_MORA') {
            await crearNotificacion(asociado._id, acueducto._id, {
              tipo: 'EN_MORA',
              titulo: 'Tienes facturas en mora',
              cuerpo: 'Tu cuenta con el acueducto ahora está en mora. Ponte al día para evitar la suspensión del servicio.',
            });
          }
        } catch (error) {
          logger.error('Error procesando asociado en job de estado', {
            acueductoId: acueducto._id,
            asociadoId: asociado._id,
            error: error.message,
          });
        }
      }
    } catch (error) {
      logger.error('Error procesando acueducto en job de estado', { acueductoId: acueducto._id, error: error.message });
    }
  }
};

// Genera la facturación del mes en curso para todos los acueductos activos
// que aún no la tengan generada (mismo servicio que usa el botón manual).
const ejecutarJobCrearFacturas = async () => {
  const acueductos = await Acueducto.find({ estado: 'ACTIVO' });
  const periodo = periodoActualBogota();

  for (const acueducto of acueductos) {
    try {
      const resultado = await generarFacturacionMasiva(acueducto, periodo);
      logger.info('Facturación automática generada', { acueductoId: acueducto._id, periodo, ...resultado });
    } catch (error) {
      logger.error('Error generando facturación automática', { acueductoId: acueducto._id, error: error.message });
    }
  }
};

const iniciarJobEstado = () => {
  // Diario a las 6:00 AM, hora Colombia: recalcula mora.
  cron.schedule('0 6 * * *', ejecutarJobEstado, { timezone: 'America/Bogota' });
  // Día 1 de cada mes a las 7:00 AM: genera la facturación del mes si no existe aún.
  cron.schedule('0 7 1 * *', ejecutarJobCrearFacturas, { timezone: 'America/Bogota' });
};

module.exports = { iniciarJobEstado, ejecutarJobEstado, ejecutarJobCrearFacturas };
