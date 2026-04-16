const crypto = require('crypto');
const QRCode = require('qrcode');

const TTL_SEGUNDOS = 30 * 24 * 60 * 60; // 30 días

// Genera el payload firmado con HMAC-SHA256
const generarPayload = (asociado) => {
  const issuedAt = Math.floor(Date.now() / 1000);
  const expiresAt = issuedAt + TTL_SEGUNDOS;

  const payload = {
    id: asociado._id.toString(),
    nombre: asociado.nombre,
    cedula: asociado.cedula,
    estado: asociado.estado,
    issuedAt,
    expiresAt,
  };

  // Firma: HMAC-SHA256 sobre los campos únicos del payload
  const dataToSign = `${payload.id}${payload.cedula}${payload.issuedAt}${payload.expiresAt}`;
  payload.sig = crypto
    .createHmac('sha256', process.env.QR_SECRET)
    .update(dataToSign)
    .digest('hex');

  return payload;
};

// Genera el QR como data URL base64 (PNG)
const generarQRBase64 = async (asociado) => {
  const payload = generarPayload(asociado);

  const qrBase64 = await QRCode.toDataURL(JSON.stringify(payload), {
    errorCorrectionLevel: 'M',
    margin: 2,
    width: 300,
    color: { dark: '#155C2E', light: '#FFFFFF' },
  });

  return {
    qrBase64,
    expiresAt: new Date(payload.expiresAt * 1000).toISOString(),
  };
};

// Verifica el contenido escaneado de un QR
const verificarQR = (contenidoQR) => {
  let payload;
  try {
    payload = JSON.parse(contenidoQR);
  } catch {
    return { valido: false, mensaje: 'Contenido del QR inválido' };
  }

  const { id, cedula, issuedAt, expiresAt, sig } = payload;

  if (!id || !cedula || !issuedAt || !expiresAt || !sig) {
    return { valido: false, mensaje: 'QR con campos incompletos' };
  }

  // Verificar firma
  const dataToSign = `${id}${cedula}${issuedAt}${expiresAt}`;
  const expectedSig = crypto
    .createHmac('sha256', process.env.QR_SECRET)
    .update(dataToSign)
    .digest('hex');

  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSig))) {
    return { valido: false, mensaje: 'Firma del QR inválida' };
  }

  // Verificar expiración
  const ahora = Math.floor(Date.now() / 1000);
  if (ahora > expiresAt) {
    return { valido: false, mensaje: 'QR expirado. El asociado debe generar uno nuevo.' };
  }

  return {
    valido: true,
    asociado: {
      id: payload.id,
      nombre: payload.nombre,
      cedula: payload.cedula,
      estado: payload.estado,
    },
    expiresAt: new Date(expiresAt * 1000).toISOString(),
  };
};

module.exports = { generarQRBase64, verificarQR };
