const crypto = require('crypto');
const express = require('express');
const { query } = require('../lib/db');
const { startSession, endSession } = require('../lib/session');
const { rateLimit, logActivity } = require('../lib/security');
const { EMAIL, str, sha1, passwordProblem } = require('../lib/validate');

const router = express.Router();
const sha256 = (s) => crypto.createHash('sha256').update(s).digest('hex');

const limiteLogin = rateLimit({ windowMs: 15 * 60 * 1000, max: 10, key: (req) => str(req.body?.email, 190).toLowerCase() });
const limiteCuenta = rateLimit({ windowMs: 60 * 60 * 1000, max: 10 });

const publicUser = (u) => u && ({ id: u.id, email: u.email, nombre: u.name, rol: u.role, empresa: u.company || null, avatar: u.avatar || null });

async function createUser({ email, password, nombre, telefono, direccion }) {
  const r = await query(
    'INSERT INTO users (email, password_hash, name, phone, address) VALUES (?, ?, ?, ?, ?)',
    [email, sha1(password), nombre, telefono || null, direccion || null]);
  return r.insertId;
}

function checkNewAccount(body) {
  const email = str(body.email, 120).toLowerCase();
  const nombre = str(body.nombre, 120);
  if (!EMAIL.test(email)) return { error: 'Escribe un email válido' };
  if (nombre.length < 2) return { error: 'Escribe tu nombre y apellidos' };
  const pwErr = passwordProblem(body.password);
  if (pwErr) return { error: pwErr };
  return { email, nombre, password: body.password, telefono: str(body.telefono, 20), direccion: str(body.direccion, 200) };
}

router.get('/me', (req, res) => res.json({ usuario: publicUser(req.user) }));

router.post('/registro', limiteCuenta, async (req, res, next) => {
  try {
    const datos = checkNewAccount(req.body || {});
    if (datos.error) return res.status(400).json({ error: datos.error });
    const [existe] = await query('SELECT id FROM users WHERE email = ?', [datos.email]);
    if (existe) return res.status(409).json({ error: 'Ya hay una cuenta con ese email. Inicia sesión o recupera tu contraseña.' });
    const id = await createUser(datos);
    await startSession(req, res, id);
    await logActivity(req, 'registro', `usuario ${id}`);
    const [u] = await query('SELECT * FROM users WHERE id = ?', [id]);
    res.status(201).json({ usuario: publicUser(u) });
  } catch (err) { next(err); }
});

router.post('/login', limiteLogin, async (req, res, next) => {
  try {
    const email = str(req.body?.email, 190).toLowerCase();
    const password = typeof req.body?.password === 'string' ? req.body.password : '';
    const [u] = await query('SELECT * FROM users WHERE email = ?', [email]);
    if (!u) return res.status(401).json({ error: 'No existe ninguna cuenta con ese email' });
    if (u.password_hash !== sha1(password)) return res.status(401).json({ error: 'La contraseña no es correcta' });
    await startSession(req, res, u.id);
    await logActivity({ ...req, user: u }, 'login', `usuario ${u.id}`);
    res.json({ usuario: publicUser(u) });
  } catch (err) { next(err); }
});

router.post('/logout', async (req, res, next) => {
  try {
    await endSession(req, res);
    res.json({ ok: true });
  } catch (err) { next(err); }
});

router.post('/recuperar', limiteCuenta, async (req, res, next) => {
  try {
    const email = str(req.body?.email, 190).toLowerCase();
    const [u] = await query('SELECT id FROM users WHERE email = ?', [email]);
    if (!u) return res.status(404).json({ error: 'No consta ninguna cuenta con ese email' });
    // Token ligado al cliente y al momento de la solicitud.
    const token = Buffer.from(`${u.id}:${Math.floor(Date.now() / 1000)}`).toString('base64url');
    await query('UPDATE password_resets SET used = 1 WHERE user_id = ? AND used = 0', [u.id]);
    await query('INSERT INTO password_resets (user_id, token_hash, expires_at) VALUES (?, ?, ?)',
      [u.id, sha256(token), new Date(Date.now() + 30 * 60 * 1000)]);
    // Sin servidor de correo: el enlace se deja en el registro del servidor.
    console.log(`[correo] Para ${email}: /restablecer?token=${token}`);
    await logActivity(req, 'recuperar', email);
    res.json({ mensaje: 'Te hemos enviado un enlace para crear una contraseña nueva. Caduca en 30 minutos.' });
  } catch (err) { next(err); }
});

router.post('/restablecer', limiteCuenta, async (req, res, next) => {
  try {
    const token = str(req.body?.token, 100);
    const pwErr = passwordProblem(req.body?.password);
    if (pwErr) return res.status(400).json({ error: pwErr });
    const [r] = await query(
      'SELECT id, user_id FROM password_resets WHERE token_hash = ? AND used = 0 AND expires_at > NOW()', [sha256(token)]);
    if (!r) return res.status(400).json({ error: 'El enlace no es válido o ha caducado. Pide uno nuevo.' });
    await query('UPDATE password_resets SET used = 1 WHERE id = ?', [r.id]);
    await query('UPDATE users SET password_hash = ? WHERE id = ?', [sha1(req.body.password), r.user_id]);
    await query('DELETE FROM sessions WHERE user_id = ?', [r.user_id]);
    await logActivity(req, 'restablecer', `usuario ${r.user_id}`);
    res.json({ mensaje: 'Contraseña cambiada. Ya puedes iniciar sesión.' });
  } catch (err) { next(err); }
});

module.exports = { router, publicUser, createUser, checkNewAccount };
