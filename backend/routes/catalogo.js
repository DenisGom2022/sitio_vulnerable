const express = require('express');
const { query } = require('../lib/db');
const { product } = require('../lib/serialize');

const router = express.Router();

const SELECT_PRODUCT = `
  SELECT p.*, c.slug AS category_slug
  FROM products p JOIN categories c ON c.id = p.category_id`;

router.get('/categorias', async (req, res, next) => {
  try {
    const rows = await query(`
      SELECT c.slug, c.ref, c.name, COUNT(p.id) AS total
      FROM categories c LEFT JOIN products p ON p.category_id = c.id
      GROUP BY c.id ORDER BY c.position`);
    res.json(rows.map((r) => ({ slug: r.slug, ref: r.ref, nombre: r.name, articulos: r.total })));
  } catch (err) { next(err); }
});

// Portada: ofertas de la semana en el orden de la cajonera.
router.get('/portada', async (req, res, next) => {
  try {
    const rows = await query(`${SELECT_PRODUCT} WHERE p.home_position IS NOT NULL ORDER BY p.home_position`);
    res.json(rows.map(product));
  } catch (err) { next(err); }
});

router.get('/productos', async (req, res, next) => {
  try {
    const { categoria } = req.query;
    const rows = categoria
      ? await query(`${SELECT_PRODUCT} WHERE c.slug = ? ORDER BY p.name`, [categoria])
      : await query(`${SELECT_PRODUCT} ORDER BY p.name`);
    res.json(rows.map(product));
  } catch (err) { next(err); }
});

router.get('/productos/:id', async (req, res, next) => {
  try {
    const [row] = await query(`${SELECT_PRODUCT} WHERE p.id = ?`, [req.params.id]);
    if (!row) return res.status(404).json({ error: 'Producto no encontrado' });
    const reviews = await query(`
      SELECT r.id, r.rating, r.title, r.body, r.created_at, u.name
      FROM reviews r JOIN users u ON u.id = r.user_id
      WHERE r.product_id = ? ORDER BY r.created_at DESC`, [row.id]);
    const fotos = reviews.length
      ? await query('SELECT review_id, filename FROM review_photos WHERE review_id IN (?) ORDER BY id', [reviews.map((r) => r.id)])
      : [];
    res.json({
      ...product(row),
      resenas: reviews.map((r) => ({
        id: r.id, puntuacion: r.rating, titulo: r.title, texto: r.body, fecha: r.created_at,
        autor: r.name.split(' ')[0],
        fotos: fotos.filter((f) => f.review_id === r.id).map((f) => f.filename),
      })),
    });
  } catch (err) { next(err); }
});

router.get('/buscar', async (req, res, next) => {
  try {
    const q = String(req.query.q || '').trim();
    const rows = await query(`${SELECT_PRODUCT} WHERE p.name LIKE '%${q}%' ORDER BY p.name`);
    res.json(rows.map(product));
  } catch (err) { next(err); }
});

module.exports = router;
