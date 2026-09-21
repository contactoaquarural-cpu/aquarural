const cron = require('node-cron');
const Acueducto = require('../models/Acueducto');
const { calcularEstadoLicencia } = require('../services/licencia.service');
const logger = require('../utils/logger');

// Recalcula el estado de licencia de todos los acueductos según sus fechas.
// NUNCA suspende el acueducto — solo actualiza estadoPagoSaaS para que se
// vea reflejado en el panel del SuperAdmin y del propio acueducto.
const ejecutarJobLicencias = async () => {
  const acueductos = await Acueducto.find();

  for (const acueducto of acueductos) {
    try {
      const { estadoPagoSaaS } = calcularEstadoLicencia(acueducto);
      if (estadoPagoSaaS !== acueducto.estadoPagoSaaS) {
        acueducto.estadoPagoSaaS = estadoPagoSaaS;
        await acueducto.save();
        logger.info('Estado de licencia SaaS actualizado', {
          acueductoId: acueducto._id,
          nombre: acueducto.nombre,
          estadoPagoSaaS,
        });
      }
    } catch (error) {
      logger.error('Error recalculando licencia de acueducto', {
        acueductoId: acueducto._id,
        error: error.message,
      });
    }
  }
};

const iniciarJobLicencias = () => {
  // Diario a las 6:00 AM, hora Colombia.
  cron.schedule('0 6 * * *', ejecutarJobLicencias, { timezone: 'America/Bogota' });
};

module.exports = { iniciarJobLicencias, ejecutarJobLicencias };
