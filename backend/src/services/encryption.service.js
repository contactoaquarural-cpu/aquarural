const crypto = require('crypto');

const ALGORITHM = 'aes-256-gcm';
const SECRET_KEY = process.env.MASTER_ENCRYPTION_KEY 
  ? crypto.scryptSync(process.env.MASTER_ENCRYPTION_KEY, 'salt-aquarural', 32)
  : crypto.scryptSync('aquarural-secret-master-key-2026', 'salt-aquarural', 32);

/**
 * Cifra un texto sensible (ej. llave privada de Wompi)
 * @param {string} text 
 * @returns {string} iv:authTag:encryptedHex
 */
const encrypt = (text) => {
  if (!text) return '';
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, SECRET_KEY, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');
  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
};

/**
 * Descifra un texto previamente cifrado
 * @param {string} encryptedString (iv:authTag:encryptedHex)
 * @returns {string} texto original
 */
const decrypt = (encryptedString) => {
  if (!encryptedString || !encryptedString.includes(':')) return '';
  const [ivHex, authTagHex, encryptedHex] = encryptedString.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, SECRET_KEY, iv);
  decipher.setAuthTag(authTag);
  let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
};

module.exports = {
  encrypt,
  decrypt,
};
