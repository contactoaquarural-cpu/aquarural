const crypto = require('crypto');
const logger = require('../utils/logger');

const BASE_URL = process.env.WOMPI_SANDBOX === 'true'
  ? 'https://sandbox.wompi.co/v1'
  : 'https://production.wompi.co/v1';

// Obtiene el acceptance token del comercio (requerido por Wompi para transacciones)
const getAcceptanceToken = async () => {
  const response = await fetch(`${BASE_URL}/merchants/${process.env.WOMPI_PUBLIC_KEY}`);
  if (!response.ok) throw new Error('Error al obtener acceptance token de Wompi');
  const data = await response.json();
  return data.data.presigned_acceptance.acceptance_token;
};

// Genera la firma de integridad para el checkout de Wompi
// SHA256(reference + amount_in_cents + currency + integrity_secret)
const generarFirmaCheckout = (reference, amountInCents) => {
  const cadena = `${reference}${amountInCents}COP${process.env.WOMPI_INTEGRITY_SECRET}`;
  return crypto.createHash('sha256').update(cadena).digest('hex');
};

// Verifica la firma del webhook enviado por Wompi
// SHA256(properties[0_val] + properties[1_val] + ... + timestamp + integrity_secret)
const verificarFirmaWebhook = (evento) => {
  try {
    const { signature, timestamp, data } = evento;
    const transaction = data?.transaction;

    if (!signature?.properties || !signature?.checksum || !transaction) return false;

    // Resolver los valores de cada propiedad usando notación dot (ej: "transaction.id")
    let cadena = '';
    for (const prop of signature.properties) {
      const keys = prop.split('.');
      let valor = evento.data;
      for (const key of keys) {
        valor = valor?.[key];
      }
      cadena += String(valor ?? '');
    }
    cadena += String(timestamp);
    cadena += process.env.WOMPI_INTEGRITY_SECRET;

    const hash = crypto.createHash('sha256').update(cadena).digest('hex');
    return hash === signature.checksum;
  } catch (error) {
    logger.error('Error al verificar firma Wompi', { error: error.message });
    return false;
  }
};

module.exports = { getAcceptanceToken, generarFirmaCheckout, verificarFirmaWebhook };
