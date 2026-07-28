const https = require('https');
const logger = require('../utils/logger');

// Envía notificaciones push via Expo Push API (soporta ExponentPushToken)
const enviarExpoPush = async (tokens, titulo, cuerpo, datos = {}) => {
  const tokensValidos = tokens.filter(
    (t) => t && (t.startsWith('ExponentPushToken[') || t.startsWith('ExpoPushToken['))
  );
  if (!tokensValidos.length) return;

  // Expo recomienda lotes de máximo 100
  const lotes = [];
  for (let i = 0; i < tokensValidos.length; i += 100) {
    lotes.push(tokensValidos.slice(i, i + 100));
  }

  for (const lote of lotes) {
    const mensajes = lote.map((token) => ({
      to:    token,
      sound: 'default',
      title: titulo,
      body:  cuerpo,
      data:  datos,
    }));

    const payload = JSON.stringify(mensajes);

    await new Promise((resolve) => {
      const req = https.request(
        {
          hostname: 'exp.host',
          path:     '/--/api/v2/push/send',
          method:   'POST',
          headers:  {
            'Content-Type':   'application/json',
            'Content-Length': Buffer.byteLength(payload),
            'Accept':         'application/json',
          },
        },
        (res) => {
          let raw = '';
          res.on('data', (chunk) => { raw += chunk; });
          res.on('end', () => {
            try {
              const body = JSON.parse(raw);
              if (body.errors) {
                logger.warn('Expo Push API errors', { errors: body.errors });
              } else {
                logger.info('Expo push enviado', { tokens: lote.length });
              }
            } catch {}
            resolve();
          });
        }
      );
      req.on('error', (e) => {
        logger.warn('Error en Expo Push request', { error: e.message });
        resolve();
      });
      req.write(payload);
      req.end();
    });
  }
};

module.exports = { enviarExpoPush };
