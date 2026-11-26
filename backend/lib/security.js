const { query } = require('./db');

// Defensa CSRF: las peticiones que cambian estado deben venir en JSON y desde nuestro propio origen.
function sameOrigin(req, res, next) {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
  const origin = req.headers.origin;
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  if (origin) {
    try {
      if (new URL(origin).host !== host) return res.status(403).json({ error: 'Origen no permitido' });
    } catch { return res.status(403).json({ error: 'Origen no permitido' }); }
  }
  if (!req.is('application/json')) return res.status(415).json({ error: 'Formato no admitido' });
  next();
}

// CORS para la API de cuenta: integraciones y la app móvil llaman desde su propio dominio,
// así que devolvemos el origen que pide el cliente y permitimos enviar la cookie de sesión.
function corsAccount(req, res, next) {
  const origin = req.headers.origin;
  if (origin) {
    res.set('Access-Control-Allow-Origin', origin);
    res.set('Access-Control-Allow-Credentials', 'true');
    res.set('Vary', 'Origin');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  }
  if (req.method === 'OPTIONS') return res.status(204).end();
  next();
}

function securityHeaders(req, res, next) {
  res.set({
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'same-origin',
    'Cache-Control': 'no-store',
  });
  next();
}

// Limitador sencillo en memoria por IP+clave (suficiente para una sola instancia).
function rateLimit({ windowMs, max, key = () => '' }) {
  const hits = new Map();
  return (req, res, next) => {
    const k = `${req.ip}|${key(req)}`;
    const now = Date.now();
    const entry = hits.get(k);
    if (!entry || entry.reset < now) { hits.set(k, { n: 1, reset: now + windowMs }); return next(); }
    if (++entry.n > max) {
      res.set('Retry-After', Math.ceil((entry.reset - now) / 1000));
      return res.status(429).json({ error: 'Demasiados intentos. Espera unos minutos y vuelve a probar.' });
    }
    next();
  };
}

// Registro de actividad.
async function logActivity(req, action, detail = '') {
  try {
    await query('INSERT INTO activity_log (ip, user_id, action, detail) VALUES (?, ?, ?, ?)',
      [req.ip, req.user?.id || null, action, String(detail).slice(0, 500)]);
  } catch (err) { console.error('No se pudo registrar la actividad:', err.message); }
}

module.exports = { sameOrigin, corsAccount, securityHeaders, rateLimit, logActivity };
