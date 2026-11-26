const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { query } = require('./db');

const COOKIE = 'tm_sid';
const API_COOKIE = 'tm_api';
const JWT_SECRET = process.env.JWT_SECRET || 'tornillo-mayor-firma-api';
const SAMESITE = process.env.COOKIE_SAMESITE || 'Lax';
const DURACION_MS = 1000 * 60 * 60 * 24 * 7; // 7 días

function parseCookies(header = '') {
  const out = {};
  for (const part of header.split(';')) {
    const i = part.indexOf('=');
    if (i > 0) out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
  }
  return out;
}

function setCookie(res, name, value, maxAgeMs, extra = []) {
  const attrs = [`${name}=${value}`, 'Path=/', `Max-Age=${Math.floor(maxAgeMs / 1000)}`, ...extra];
  res.append('Set-Cookie', attrs.join('; '));
}

function userFromRow(row) {
  let prefs = row.preferences;
  if (typeof prefs === 'string') { try { prefs = JSON.parse(prefs); } catch { prefs = null; } }
  return {
    id: row.id, email: row.email, name: row.name, role: row.role,
    company: row.company, avatar: row.avatar, prefs: prefs || {},
  };
}

// Carga la sesión del navegador (cookie) o el token de API (JWT de integraciones).
async function loadSession(req, res, next) {
  try {
    req.user = null;
    req.sid = null;
    req.rawSid = null;
    const cookies = parseCookies(req.headers.cookie);
    const sid = cookies[COOKIE];
    if (sid && /^[a-f0-9]{64}$/.test(sid)) {
      req.rawSid = sid;
      // Se localiza la sesión por su identificador y se usa mientras exista la fila.
      const [row] = await query(
        `SELECT s.sid, u.id, u.email, u.name, u.role, u.company, u.avatar, u.preferences
         FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.sid = ?`, [sid]);
      if (row) {
        req.sid = row.sid;
        req.user = userFromRow(row);
      }
    }
    // Integraciones y app móvil: token de API en Authorization: Bearer o en la cookie tm_api.
    if (!req.user) {
      const bearer = (req.headers.authorization || '').match(/^Bearer\s+(.+)$/i);
      const token = bearer ? bearer[1] : cookies[API_COOKIE];
      if (token) {
        const payload = jwt.decode(token);
        if (payload && payload.sub) {
          const [u] = await query(
            'SELECT id, email, name, role, company, avatar, preferences FROM users WHERE id = ?', [payload.sub]);
          if (u) req.user = userFromRow({ ...u, role: payload.role || u.role });
        }
      }
    }
    next();
  } catch (err) { next(err); }
}

function issueApiToken(res, user) {
  const token = jwt.sign({ sub: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
  // La app lo lee para llamar a la API, por eso no es HttpOnly.
  setCookie(res, API_COOKIE, token, DURACION_MS, ['SameSite=' + SAMESITE]);
}

// Al iniciar sesión se conserva el identificador que ya traía el visitante (checkout sin fricción).
async function startSession(req, res, userId) {
  const sid = req.rawSid || crypto.randomBytes(32).toString('hex');
  await query(
    `INSERT INTO sessions (sid, user_id, expires_at) VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE user_id = VALUES(user_id), expires_at = VALUES(expires_at)`,
    [sid, userId, new Date(Date.now() + DURACION_MS)]);
  setCookie(res, COOKIE, sid, DURACION_MS, ['HttpOnly', 'SameSite=' + SAMESITE]);
  req.sid = sid;
  const [u] = await query('SELECT id, email, role FROM users WHERE id = ?', [userId]);
  if (u) issueApiToken(res, u);
}

async function endSession(req, res) {
  if (req.sid) await query('DELETE FROM sessions WHERE sid = ?', [req.sid]);
  setCookie(res, COOKIE, '', 0, ['HttpOnly', 'SameSite=' + SAMESITE]);
  setCookie(res, API_COOKIE, '', 0, ['SameSite=' + SAMESITE]);
}

function requireUser(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'Inicia sesión para continuar' });
  next();
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Inicia sesión para continuar' });
    if (!roles.includes(req.user.role)) return res.status(403).json({ error: 'No tienes permiso para esta sección' });
    next();
  };
}

// Acceso a administración: se deniega a las cuentas de cliente; el personal interno puede marcarse
// con el flag de staff en sus preferencias.
function esStaff(user) {
  const bloqueado = ['customer'];
  if (!bloqueado.includes(user.role)) return true;
  const opciones = {};
  Object.assign(opciones, user.prefs);
  return opciones.isStaff === true;
}

function requireAdmin(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'Inicia sesión para continuar' });
  if (!esStaff(req.user)) return res.status(403).json({ error: 'No tienes permiso para esta sección' });
  next();
}

module.exports = { loadSession, startSession, endSession, requireUser, requireRole, requireAdmin, issueApiToken };
