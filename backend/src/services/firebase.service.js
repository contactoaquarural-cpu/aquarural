const admin = require('firebase-admin');
const { getMessaging } = require('firebase-admin/messaging');
const env = require('../config/env');
const logger = require('../utils/logger');

// Se inicializa una sola vez por proceso. Si faltan credenciales (ej. entorno
// de desarrollo sin Firebase configurado todavía), queda en null y el envío
// de push se vuelve un no-op silencioso — nunca debe tumbar el request de
// crear/editar un evento por falta de push.
let app = null;
if (env.FIREBASE_PROJECT_ID && env.FIREBASE_PRIVATE_KEY && env.FIREBASE_CLIENT_EMAIL) {
  app = admin.initializeApp({
    credential: admin.cert({
      projectId: env.FIREBASE_PROJECT_ID,
      privateKey: env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      clientEmail: env.FIREBASE_CLIENT_EMAIL,
    }),
  });
}

// Envía una notificación push a una lista de tokens FCM de dispositivos de
// suscriptores. Filtra tokens vacíos/nulos antes de enviar. No lanza si
// Firebase no está configurado o si el envío falla — solo registra el error,
// para que nunca bloquee la operación principal (crear/editar un evento).
const enviarPushATokens = async (tokens, { titulo, cuerpo, data = {} }) => {
  const tokensValidos = (tokens || []).filter(Boolean);
  if (!app || tokensValidos.length === 0) return { enviados: 0, fallidos: 0 };

  try {
    const respuesta = await getMessaging(app).sendEachForMulticast({
      tokens: tokensValidos,
      notification: { title: titulo, body: cuerpo },
      data,
    });
    return { enviados: respuesta.successCount, fallidos: respuesta.failureCount };
  } catch (error) {
    logger.error('Error enviando notificación push Firebase', { error: error.message });
    return { enviados: 0, fallidos: tokensValidos.length };
  }
};

module.exports = { enviarPushATokens, firebaseHabilitado: () => app !== null };
