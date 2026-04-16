const logger = require('../utils/logger');

let admin = null;
let initialized = false;

// Inicialización lazy: solo se activa cuando las credenciales están configuradas
const inicializar = () => {
  if (initialized) return;
  if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_PRIVATE_KEY || !process.env.FIREBASE_CLIENT_EMAIL) {
    logger.warn('Firebase no configurado — push notifications deshabilitadas');
    return;
  }

  try {
    admin = require('firebase-admin');
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      }),
    });
    initialized = true;
    logger.info('Firebase Admin SDK inicializado');
  } catch (error) {
    logger.error('Error al inicializar Firebase', { error: error.message });
  }
};

// Envía una notificación push a un dispositivo específico
const enviarNotificacion = async (fcmToken, titulo, mensaje) => {
  if (!initialized || !fcmToken) return;

  try {
    await admin.messaging().send({
      token: fcmToken,
      notification: { title: titulo, body: mensaje },
    });
  } catch (error) {
    // No lanzar — un token inválido no debe romper el flujo principal
    logger.warn('Error al enviar push notification', { fcmToken, error: error.message });
  }
};

// Envía notificación push a múltiples dispositivos
const enviarNotificacionMasiva = async (fcmTokens, titulo, mensaje) => {
  if (!initialized || !fcmTokens?.length) return;

  const tokensValidos = fcmTokens.filter(Boolean);
  if (!tokensValidos.length) return;

  try {
    await admin.messaging().sendEachForMulticast({
      tokens: tokensValidos,
      notification: { title: titulo, body: mensaje },
    });
  } catch (error) {
    logger.warn('Error en envío masivo de push notifications', { error: error.message });
  }
};

module.exports = { inicializar, enviarNotificacion, enviarNotificacionMasiva };
