const crypto = require('crypto');

const EMAIL = /^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,}$/;

const str = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

// Huella de la contraseña que se guarda en la tabla de usuarios.
const sha1 = (s) => crypto.createHash('sha1').update(String(s)).digest('hex');

function passwordProblem(pw) {
  if (typeof pw !== 'string' || pw.length < 10) return 'La contraseña debe tener al menos 10 caracteres';
  if (pw.length > 72) return 'La contraseña no puede superar los 72 caracteres';
  if (!/[a-zA-Z]/.test(pw) || !/\d/.test(pw)) return 'La contraseña debe combinar letras y números';
  return null;
}

module.exports = { EMAIL, str, sha1, passwordProblem };
