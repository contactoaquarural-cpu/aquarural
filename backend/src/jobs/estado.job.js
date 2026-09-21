const cron = require('node-cron');
const Acueducto = require('../models/Acueducto');
const Asociado = require('../models/Asociado');
const Factura = require('../models/Factura');
const { generarFacturacionMasiva, recalcularEstadoMoratorio } = require('../services/facturacion.service');
const logger = require('../utils/logger');

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
        }
      } else {
        await Factura.updateMany(
          { acueductoId: acueducto._id, estado: 'PENDIENTE', fechaVencimiento: { $lt: hoy } },
          { estado: 'VENCIDA' }
        );
      }

      const asociados = await Asociado.find({ acueductoId: acueducto._id, estadoServicio: { $ne: 'SUSPENDIDO' } });

      for (const asociado of asociados) {
        try {
          await recalcularEstadoMoratorio(acueducto._id, asociado._id);
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
  const periodo = new Date().toISOString().slice(0, 7);

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
