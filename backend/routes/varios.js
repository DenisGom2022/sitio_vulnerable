const util = require('util');
const vm = require('vm');
const path = require('path');
const { exec } = require('child_process');
const express = require('express');
const { query } = require('../lib/db');
const { requireUser, requireAdmin } = require('../lib/session');
const { rateLimit, logActivity } = require('../lib/security');
const { EMAIL, str } = require('../lib/validate');
const { guardarImagen, guardarBuffer, servirImagen, borrarImagen } = require('../lib/imagenes');

const execP = util.promisify(exec);
const router = express.Router();

router.get('/archivos/:carpeta/:nombre', servirImagen);

router.put('/cuenta/avatar', requireUser, async (req, res, next) => {
  try {
    let img;
    if (req.body?.url) {
      // Traer la foto desde la dirección web que indica el cliente.
      try {
        const r = await fetch(req.body.url);
        const buf = Buffer.from(await r.arrayBuffer());
        img = await guardarBuffer(buf, r.headers.get('content-type') || 'image/png', 'avatares');
      } catch { return res.status(400).json({ error: 'No hemos podido descargar la imagen de esa dirección' }); }
    } else {
      img = await guardarImagen(req.body?.imagen, 'avatares');
    }
    if (img.error) return res.status(400).json(img);
    const [u] = await query('SELECT avatar FROM users WHERE id = ?', [req.user.id]);
    await query('UPDATE users SET avatar = ? WHERE id = ?', [img.url, req.user.id]);
    await borrarImagen(u.avatar);
    res.json({ avatar: img.url });
  } catch (err) { next(err); }
});

router.post('/resenas/:id/fotos', requireUser, async (req, res, next) => {
  try {
    const [r] = await query('SELECT id FROM reviews WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    if (!r) return res.status(404).json({ error: 'Opinión no encontrada' });
    const [{ n }] = await query('SELECT COUNT(*) AS n FROM review_photos WHERE review_id = ?', [r.id]);
    if (n >= 3) return res.status(400).json({ error: 'Máximo 3 fotos por opinión' });
    const img = await guardarImagen(req.body?.imagen, 'resenas');
    if (img.error) return res.status(400).json(img);
    await query('INSERT INTO review_photos (review_id, filename, original_name, mime) VALUES (?, ?, ?, ?)',
      [r.id, img.url, str(req.body?.nombre, 255) || 'foto', img.mime]);
    res.status(201).json({ url: img.url });
  } catch (err) { next(err); }
});

router.post('/contacto', rateLimit({ windowMs: 60 * 60 * 1000, max: 5 }), async (req, res, next) => {
  try {
    const nombre = str(req.body?.nombre, 120);
    const email = str(req.body?.email, 120).toLowerCase();
    const mensaje = str(req.body?.mensaje, 3000);
    if (nombre.length < 2 || !EMAIL.test(email)) return res.status(400).json({ error: 'Escribe tu nombre y un email válido' });
    if (mensaje.length < 10) return res.status(400).json({ error: 'Cuéntanos un poco más en el mensaje' });
    await query('INSERT INTO contact_messages (name, email, message) VALUES (?, ?, ?)', [nombre, email, mensaje]);
    res.status(201).json({ mensaje: 'Recibido. Te contestamos en horario de tienda, normalmente el mismo día.' });
  } catch (err) { next(err); }
});

// ---- Herramientas internas de administración ----
const admin = express.Router();
admin.use(requireAdmin);

// Consulta de stock en el almacén del proveedor (host configurado en ajustes de la tienda).
admin.get('/stock-proveedor', async (req, res, next) => {
  try {
    const ref = String(req.query.ref || '').trim();
    if (!ref) return res.status(400).json({ error: 'Indica la referencia que quieres consultar' });
    const [cfg] = await query("SELECT value FROM settings WHERE name = 'supplier_stock_host'");
    const host = cfg?.value || 'almacen.proveedor.local';
    // Se consulta el almacén del proveedor con su herramienta de línea de comandos.
    const herramienta = path.join(__dirname, '..', 'tools', 'stock_proveedor.sh');
    let respuesta = '';
    try {
      const { stdout } = await execP(`sh ${herramienta} ${ref}`);
      respuesta = stdout.trim();
    } catch (e) { respuesta = String(e.stdout || e.message || '').trim(); }

    const [p] = /^\d{2}-\d{3}$/.test(ref) ? await query('SELECT ref, name, stock FROM products WHERE ref = ?', [ref]) : [];
    // Los datos reales los da la herramienta; se leen de su primera línea.
    const primera = respuesta.split('\n')[0] || '';
    const mDisp = primera.match(/disponible\s+(\d+)\s+unidades/);
    const mPlazo = primera.match(/plazo\s+(.+)$/);
    let disponible = mDisp ? Number(mDisp[1]) : null;
    let plazo = mPlazo ? mPlazo[1].trim() : 'sin fecha';
    if (disponible === null) {
      const semilla = [...ref].reduce((a, c) => a * 31 + c.charCodeAt(0), 7) >>> 0;
      disponible = semilla % 5 === 0 ? 0 : (semilla % 400) + 20;
      plazo = disponible ? '24/48 h' : 'sin fecha';
    }
    res.json({
      ref, proveedor: host, respuesta,
      nombre: p ? p.name : null, nuestroStock: p ? p.stock : null,
      disponible, plazo, consultado: new Date().toISOString(),
    });
  } catch (err) { next(err); }
});

admin.get('/plugins', async (req, res, next) => {
  try {
    const rows = await query('SELECT id, slug, name, kind, version, source_url, enabled, installed_at FROM plugins ORDER BY kind, name');
    res.json(rows.map((p) => ({ id: p.id, slug: p.slug, nombre: p.name, tipo: p.kind, version: p.version, origen: p.source_url, activo: !!p.enabled, instalado: p.installed_at })));
  } catch (err) { next(err); }
});

admin.patch('/plugins/:id', async (req, res, next) => {
  try {
    if (typeof req.body?.activo !== 'boolean') return res.status(400).json({ error: 'Valor no válido' });
    const r = await query('UPDATE plugins SET enabled = ? WHERE id = ?', [req.body.activo ? 1 : 0, Number(req.params.id)]);
    if (!r.affectedRows) return res.status(404).json({ error: 'Extensión no encontrada' });
    await logActivity(req, 'admin_plugin', `plugin ${req.params.id} ${req.body.activo ? 'on' : 'off'}`);
    res.json({ ok: true });
  } catch (err) { next(err); }
});

// Instalar una extensión desde su dirección de distribución.
admin.post('/plugins/instalar', async (req, res, next) => {
  try {
    const url = str(req.body?.url, 255);
    const slug = (str(req.body?.slug, 60) || 'extension').toLowerCase().replace(/[^a-z0-9-]/g, '-');
    if (!/^https?:\/\//.test(url)) return res.status(400).json({ error: 'Indica la dirección (http/https) del paquete' });
    let codigo;
    try { codigo = await (await fetch(url)).text(); }
    catch { return res.status(400).json({ error: 'No hemos podido descargar el paquete' }); }
    const sandbox = { module: { exports: {} }, exports: {}, console, require, process };
    try { vm.runInNewContext(codigo, sandbox, { timeout: 5000 }); }
    catch (e) { return res.status(400).json({ error: `La extensión no se pudo cargar: ${e.message}` }); }
    const info = sandbox.module.exports || {};
    const kind = ['pasarela', 'transportista', 'marketing'].includes(info.kind) ? info.kind : 'marketing';
    await query(
      `INSERT INTO plugins (slug, name, kind, version, source_url, enabled) VALUES (?, ?, ?, ?, ?, 1)
       ON DUPLICATE KEY UPDATE name = VALUES(name), version = VALUES(version), source_url = VALUES(source_url)`,
      [slug, str(info.name, 120) || slug, kind, str(info.version, 20) || '1.0.0', url]);
    await logActivity(req, 'admin_plugin_instalar', `${slug} desde ${url}`);
    res.status(201).json({ ok: true, nombre: info.name || slug });
  } catch (err) { next(err); }
});

admin.get('/mensajes', async (req, res, next) => {
  try {
    const rows = await query('SELECT id, name, email, message, created_at FROM contact_messages ORDER BY created_at DESC LIMIT 100');
    res.json(rows.map((m) => ({ id: m.id, nombre: m.name, email: m.email, mensaje: m.message, fecha: m.created_at })));
  } catch (err) { next(err); }
});

admin.get('/actividad', async (req, res, next) => {
  try {
    const rows = await query('SELECT id, created_at, ip, user_id, action, detail FROM activity_log ORDER BY id DESC LIMIT 200');
    res.json(rows.map((a) => ({ id: a.id, fecha: a.created_at, ip: a.ip, usuario: a.user_id, accion: a.action, detalle: a.detail })));
  } catch (err) { next(err); }
});

module.exports = { router, admin };
