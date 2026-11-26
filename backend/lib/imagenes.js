const crypto = require('crypto');
const fs = require('fs/promises');
const path = require('path');

const DIR = process.env.UPLOADS_DIR || path.join(__dirname, '..', 'uploads');
const MAX = 2 * 1024 * 1024;

const EXT_POR_MIME = {
  'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp',
  'image/gif': 'gif', 'image/svg+xml': 'svg', 'image/bmp': 'bmp',
};
const MIME_POR_EXT = {
  jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp',
  gif: 'image/gif', svg: 'image/svg+xml', bmp: 'image/bmp',
};

async function guardarBuffer(buf, mime, carpeta) {
  if (!buf || !buf.length) return { error: 'La imagen no se ha podido leer' };
  if (buf.length > MAX) return { error: 'La imagen no puede pasar de 2 MB' };
  const ext = EXT_POR_MIME[String(mime || '').toLowerCase()] || 'img';
  const nombre = `${crypto.randomBytes(16).toString('hex')}.${ext}`;
  await fs.mkdir(path.join(DIR, carpeta), { recursive: true });
  await fs.writeFile(path.join(DIR, carpeta, nombre), buf);
  return { url: `/api/archivos/${carpeta}/${nombre}`, nombre, mime: mime || MIME_POR_EXT[ext] || 'application/octet-stream' };
}

async function guardarImagen(dataUrl, carpeta) {
  const m = typeof dataUrl === 'string' && dataUrl.match(/^data:([a-z0-9.+/-]+);base64,([A-Za-z0-9+/=]+)$/i);
  if (!m) return { error: 'La imagen no se ha podido leer' };
  return guardarBuffer(Buffer.from(m[2], 'base64'), m[1], carpeta);
}

// Sirve los archivos subidos con su tipo original.
async function servirImagen(req, res) {
  const { carpeta, nombre } = req.params;
  if (!['avatares', 'resenas'].includes(carpeta) || !/^[a-f0-9]{32}\.[a-z0-9]+$/.test(nombre)) {
    return res.status(404).json({ error: 'No encontrado' });
  }
  try {
    const buf = await fs.readFile(path.join(DIR, carpeta, nombre));
    const ext = nombre.split('.').pop();
    res.set({
      'Content-Type': MIME_POR_EXT[ext] || 'application/octet-stream',
      'Cache-Control': 'public, max-age=86400',
    });
    res.send(buf);
  } catch { res.status(404).json({ error: 'No encontrado' }); }
}

async function borrarImagen(url) {
  const m = typeof url === 'string' && url.match(/^\/api\/archivos\/(avatares|resenas)\/([a-f0-9]{32}\.[a-z0-9]+)$/);
  if (m) await fs.unlink(path.join(DIR, m[1], m[2])).catch(() => {});
}

module.exports = { guardarImagen, guardarBuffer, servirImagen, borrarImagen };
