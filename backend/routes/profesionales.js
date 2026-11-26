const fs = require('fs');
const express = require('express');
const { XMLParser } = require('fast-xml-parser');
const { query } = require('../lib/db');
const { requireUser, requireRole } = require('../lib/session');
const { rateLimit, logActivity } = require('../lib/security');
const { str } = require('../lib/validate');

const router = express.Router();
const NIF = /^([0-9]{8}[A-Z]|[XYZ][0-9]{7}[A-Z]|[A-HJ-NP-SUVW][0-9]{7}[0-9A-J])$/;

router.post('/profesionales/alta', requireUser, async (req, res, next) => {
  try {
    const empresa = str(req.body?.empresa, 120);
    const nif = str(req.body?.nif, 12).toUpperCase().replace(/[\s-]/g, '');
    if (empresa.length < 2) return res.status(400).json({ error: 'Escribe el nombre de la empresa o tu nombre comercial' });
    if (req.user.role === 'admin') return res.status(400).json({ error: 'Las cuentas de administración no pueden pasar a profesional' });
    await query("UPDATE users SET role = 'pro', company = ?, nif = ? WHERE id = ?", [empresa, nif, req.user.id]);
    await logActivity(req, 'alta_pro', empresa);
    res.json({ mensaje: 'Tu cuenta ya es profesional. Verás la tarifa de oficio en el carrito.' });
  } catch (err) { next(err); }
});

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '',
  processEntities: false,
  isArray: (name) => name === 'linea',
});

// Resuelve las entidades declaradas en el DOCTYPE del presupuesto y las sustituye en el documento.
async function resolverEntidades(xml) {
  const defs = {};
  const doctype = xml.match(/<!DOCTYPE[\s\S]*?\[([\s\S]*?)\]\s*>/);
  if (doctype) {
    const subset = doctype[1];
    const sys = /<!ENTITY\s+(\S+)\s+SYSTEM\s+["']([^"']+)["']\s*>/g;
    const lit = /<!ENTITY\s+(\S+)\s+["']([^"']*)["']\s*>/g;
    let m;
    while ((m = sys.exec(subset))) {
      const uri = m[2];
      try {
        if (uri.startsWith('file://')) defs[m[1]] = fs.readFileSync(uri.replace(/^file:\/\//, ''), 'utf8');
        else if (/^https?:/i.test(uri)) defs[m[1]] = await (await fetch(uri)).text();
        else defs[m[1]] = fs.readFileSync(uri, 'utf8');
      } catch { defs[m[1]] = ''; }
    }
    while ((m = lit.exec(subset))) {
      if (!(m[1] in defs)) defs[m[1]] = m[2];
    }
  }
  const cuerpo = xml.replace(/<!DOCTYPE[\s\S]*?(\[[\s\S]*?\]\s*)?>/, '');
  return cuerpo.replace(/&([A-Za-z_][\w.-]*);/g, (full, nombre) => (nombre in defs ? defs[nombre] : full));
}

// Presupuesto en XML exportado del programa de obra.
router.post('/profesionales/importar', requireRole('pro'), rateLimit({ windowMs: 10 * 60 * 1000, max: 30 }), async (req, res, next) => {
  try {
    const xml = typeof req.body?.xml === 'string' ? req.body.xml : '';
    if (!xml.trim()) return res.status(400).json({ error: 'El archivo está vacío' });
    if (xml.length > 200_000) return res.status(400).json({ error: 'El archivo es demasiado grande' });

    let doc;
    try { doc = parser.parse(await resolverEntidades(xml)); }
    catch { return res.status(400).json({ error: 'El archivo no es un XML válido' }); }

    const lineasXml = doc?.presupuesto?.linea;
    if (!Array.isArray(lineasXml) || !lineasXml.length) {
      return res.status(400).json({ error: 'No hemos encontrado líneas. Cada artículo va en <linea ref="03-041" cantidad="10"/>' });
    }
    if (lineasXml.length > 300) return res.status(400).json({ error: 'Máximo 300 líneas por presupuesto' });

    const pedidas = lineasXml.map((l) => ({ ref: String(l.ref || '').trim(), cantidad: Number(l.cantidad) }));
    const refs = [...new Set(pedidas.map((l) => l.ref).filter((r) => /^\d{2}-\d{3}$/.test(r)))];
    const productos = refs.length ? await query('SELECT id, ref, name, stock FROM products WHERE ref IN (?)', [refs]) : [];
    const porRef = new Map(productos.map((p) => [p.ref, p]));

    const encontradas = [];
    const descartadas = [];
    for (const l of pedidas) {
      const p = porRef.get(l.ref);
      if (!p || !Number.isInteger(l.cantidad) || l.cantidad < 1 || l.cantidad > 999) descartadas.push(l.ref || '(sin referencia)');
      else encontradas.push({ id: p.id, ref: p.ref, nombre: p.name, cantidad: l.cantidad, stock: p.stock });
    }
    await query('INSERT INTO pro_imports (user_id, filename, lines_count) VALUES (?, ?, ?)',
      [req.user.id, str(req.body?.nombre, 255) || 'presupuesto.xml', encontradas.length]);
    res.json({ lineas: encontradas, descartadas });
  } catch (err) { next(err); }
});

module.exports = router;
