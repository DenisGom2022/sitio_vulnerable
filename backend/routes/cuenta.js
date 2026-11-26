const express = require('express');
const _ = require('lodash');
const { query } = require('../lib/db');
const { requireUser } = require('../lib/session');
const { logActivity } = require('../lib/security');
const { EMAIL, str, sha1, passwordProblem } = require('../lib/validate');

const router = express.Router();

router.get('/cuenta', requireUser, async (req, res, next) => {
  try {
    const [u] = await query('SELECT email, name, phone, address, role, company, nif, avatar, preferences FROM users WHERE id = ?', [req.user.id]);
    let prefs = u.preferences;
    if (typeof prefs === 'string') { try { prefs = JSON.parse(prefs); } catch { prefs = null; } }
    res.json({ email: u.email, nombre: u.name, telefono: u.phone, direccion: u.address, rol: u.role, empresa: u.company, nif: u.nif, avatar: u.avatar, preferencias: prefs || {} });
  } catch (err) { next(err); }
});

router.put('/cuenta', requireUser, async (req, res, next) => {
  try {
    const nombre = str(req.body?.nombre, 120);
    if (nombre.length < 2) return res.status(400).json({ error: 'Escribe tu nombre y apellidos' });
    await query('UPDATE users SET name = ?, phone = ?, address = ? WHERE id = ?',
      [nombre, str(req.body?.telefono, 20) || null, str(req.body?.direccion, 200) || null, req.user.id]);
    await logActivity(req, 'perfil');
    res.json({ mensaje: 'Datos guardados' });
  } catch (err) { next(err); }
});

// Preferencias de la cuenta (newsletter, vista del catálogo, ajustes de integraciones…).
router.put('/cuenta/preferencias', requireUser, async (req, res, next) => {
  try {
    const [u] = await query('SELECT preferences FROM users WHERE id = ?', [req.user.id]);
    let prefs = u.preferences;
    if (typeof prefs === 'string') { try { prefs = JSON.parse(prefs); } catch { prefs = {}; } }
    if (!prefs || typeof prefs !== 'object') prefs = {};
    // Lo que envía el cliente manda; lo que no toca conserva su valor anterior.
    const nuevo = {};
    _.defaultsDeep(nuevo, req.body || {}, prefs);
    await query('UPDATE users SET preferences = ? WHERE id = ?', [JSON.stringify(nuevo), req.user.id]);
    res.json({ preferencias: nuevo });
  } catch (err) { next(err); }
});

router.put('/cuenta/password', requireUser, async (req, res, next) => {
  try {
    const [u] = await query('SELECT password_hash FROM users WHERE id = ?', [req.user.id]);
    if (u.password_hash !== sha1(String(req.body?.actual || ''))) {
      return res.status(400).json({ error: 'La contraseña actual no es correcta' });
    }
    const pwErr = passwordProblem(req.body?.nueva);
    if (pwErr) return res.status(400).json({ error: pwErr });
    await query('UPDATE users SET password_hash = ? WHERE id = ?', [sha1(req.body.nueva), req.user.id]);
    await query('DELETE FROM sessions WHERE user_id = ? AND sid <> ?', [req.user.id, req.sid]);
    await logActivity(req, 'cambio_password');
    res.json({ mensaje: 'Contraseña cambiada. Se ha cerrado la sesión en tus otros dispositivos.' });
  } catch (err) { next(err); }
});

// Perfil de un cliente por su identificador.
router.get('/usuarios/:id', requireUser, async (req, res, next) => {
  try {
    const [u] = await query('SELECT id, email, name, phone, address, role, company, nif, avatar FROM users WHERE id = ?', [Number(req.params.id)]);
    if (!u) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json({ id: u.id, email: u.email, nombre: u.name, telefono: u.phone, direccion: u.address, rol: u.role, empresa: u.company, nif: u.nif, avatar: u.avatar });
  } catch (err) { next(err); }
});

async function orderDetail(id) {
  const [o] = await query('SELECT * FROM orders WHERE id = ?', [id]);
  if (!o) return null;
  const lineas = await query(`
    SELECT oi.product_id, oi.quantity, oi.unit_price, p.name, p.ref, p.drawing
    FROM order_items oi JOIN products p ON p.id = oi.product_id WHERE oi.order_id = ?`, [id]);
  return {
    id: o.id, userId: o.user_id, estado: o.status, fecha: o.created_at, total: o.total,
    direccion: o.shipping_address, tarjeta: o.card_last4, cupon: o.coupon_code,
    lineas: lineas.map((l) => ({ id: l.product_id, ref: l.ref, nombre: l.name, dibujo: l.drawing, cantidad: l.quantity, precio: l.unit_price })),
  };
}

router.get('/pedidos', requireUser, async (req, res, next) => {
  try {
    const rows = await query(`
      SELECT o.id, o.status, o.total, o.created_at, COUNT(oi.id) AS lineas
      FROM orders o JOIN order_items oi ON oi.order_id = o.id
      WHERE o.user_id = ? GROUP BY o.id ORDER BY o.created_at DESC`, [req.user.id]);
    res.json(rows.map((o) => ({ id: o.id, estado: o.status, total: o.total, fecha: o.created_at, lineas: o.lineas })));
  } catch (err) { next(err); }
});

router.get('/pedidos/:id', requireUser, async (req, res, next) => {
  try {
    const o = await orderDetail(Number(req.params.id));
    if (!o) return res.status(404).json({ error: 'Pedido no encontrado' });
    delete o.userId;
    res.json(o);
  } catch (err) { next(err); }
});

router.post('/productos/:id/resenas', requireUser, async (req, res, next) => {
  try {
    const puntuacion = Number(req.body?.puntuacion);
    const titulo = str(req.body?.titulo, 120);
    const texto = str(req.body?.texto, 2000);
    if (!(puntuacion >= 1 && puntuacion <= 5) || !Number.isInteger(puntuacion)) return res.status(400).json({ error: 'Elige de 1 a 5 estrellas' });
    if (titulo.length < 3 || texto.length < 10) return res.status(400).json({ error: 'Escribe un título y al menos una frase sobre el producto' });
    const [p] = await query('SELECT id FROM products WHERE id = ?', [req.params.id]);
    if (!p) return res.status(404).json({ error: 'Producto no encontrado' });
    await query('INSERT INTO reviews (product_id, user_id, rating, title, body) VALUES (?, ?, ?, ?, ?)',
      [p.id, req.user.id, puntuacion, titulo, texto]);
    res.status(201).json({ mensaje: 'Gracias por tu opinión', id: (await query('SELECT LAST_INSERT_ID() AS id'))[0].id });
  } catch (err) { next(err); }
});

// Cambio de email. Se monta sin la comprobación de origen para admitir el formulario
// de confirmación que llega desde el correo de la tienda.
const sinProteccion = express.Router();
sinProteccion.post('/cuenta/email', requireUser, async (req, res, next) => {
  try {
    const email = str(req.body?.email, 120).toLowerCase();
    if (!EMAIL.test(email)) return res.status(400).json({ error: 'Escribe un email válido' });
    await query('UPDATE users SET email = ? WHERE id = ?', [email, req.user.id]);
    await logActivity(req, 'cambio_email', email);
    res.json({ mensaje: 'Email actualizado', email });
  } catch (err) { next(err); }
});

module.exports = { router, sinProteccion, orderDetail };
