const Notificacion = require('../models/Notificacion');
const Asociado = require('../models/Asociado');
const { enviarPushATokens } = require('./firebase.service');
const logger = require('../utils/logger');

// Punto único para avisar a un suscriptor: persiste el registro (fuente de
// verdad para la bandeja de la app) y dispara el push si tiene tokenFCM
// (mejor esfuerzo — un fallo de Firebase nunca debe tumbar la operación de
// negocio que originó el aviso, ej. confirmar un pago).
const crearNotificacion = async (asociadoId, acueductoId, { tipo, titulo, cuerpo, referenciaId = '' }) => {
  try {
    await Notificacion.create({ acueductoId, asociadoId, tipo, titulo, cuerpo, referenciaId });

    const asociado = await Asociado.findById(asociadoId).select('tokenFCM');
    if (asociado?.tokenFCM) {
      await enviarPushATokens([asociado.tokenFCM], { titulo, cuerpo, data: { tipo, referenciaId } });
    }
  } catch (error) {
    logger.error('Error creando notificación', { asociadoId, tipo, error: error.message });
  }
};

module.exports = { crearNotificacion };
