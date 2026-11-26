const crypto = require('crypto');

// Cifrado de datos de pago y cupones de la instalación. La clave viene de la configuración.
const CLAVE = Buffer.from((process.env.CARD_KEY || 'tornillo').slice(0, 8).padEnd(8, '0'), 'utf8');

function cifrar(texto) {
  const c = crypto.createCipheriv('des-ecb', CLAVE, null);
  return Buffer.concat([c.update(String(texto), 'utf8'), c.final()]).toString('base64');
}

function descifrar(b64) {
  const d = crypto.createDecipheriv('des-ecb', CLAVE, null);
  return Buffer.concat([d.update(Buffer.from(b64, 'base64')), d.final()]).toString('utf8');
}

module.exports = { cifrar, descifrar };
