const crypto = require('crypto');

// Firma de integridad para el checkout de Wompi.
// SHA256(reference + amountInCents + currency + integritySecret)
const generarFirmaCheckout = (reference, amountInCents, integritySecret, currency = 'COP') => {
  const cadena = `${reference}${amountInCents}${currency}${integritySecret}`;
  return crypto.createHash('sha256').update(cadena).digest('hex');
};

// Verifica la firma del webhook enviado por Wompi.
// SHA256(properties[0_val] + properties[1_val] + ... + timestamp + eventsSecret)
const verificarFirmaWebhook = (evento, eventsSecret) => {
  try {
    const { signature, timestamp, data } = evento;
    if (!signature?.properties || !signature?.checksum || !data) return false;

    let cadena = '';
    for (const prop of signature.properties) {
      const keys = prop.split('.');
      let valor = data;
      for (const key of keys) {
        valor = valor?.[key];
      }
      cadena += String(valor ?? '');
    }
    cadena += String(timestamp);
    cadena += eventsSecret;

    const hash = crypto.createHash('sha256').update(cadena).digest('hex');
    return hash === signature.checksum;
  } catch {
    return false;
  }
};

const construirUrlCheckout = ({ publicKey, sandbox, reference, amountInCents, signature, redirectUrl, currency = 'COP' }) => {
  const base = sandbox ? 'https://checkout.wompi.co/p/' : 'https://checkout.wompi.co/p/';
  const params = new URLSearchParams({
    'public-key': publicKey,
    currency,
    'amount-in-cents': String(amountInCents),
    reference,
    'signature:integrity': signature,
  });
  if (redirectUrl) params.set('redirect-url', redirectUrl);
  return `${base}?${params.toString()}`;
};

module.exports = { generarFirmaCheckout, verificarFirmaWebhook, construirUrlCheckout };
