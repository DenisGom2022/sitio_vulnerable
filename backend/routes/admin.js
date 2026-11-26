const express = require('express');
const { query } = require('../lib/db');
const { requireAdmin } = require('../lib/session');
const { logActivity } = require('../lib/security');
const { orderDetail } = require('./cuenta');

const router = express.Router();
router.use(requireAdmin);

const ESTADOS = ['pendiente', 'preparando', 'enviado', 'entregado', 'cancelado'];

router.get('/resumen', async (req, res, next) => {
  try {
    const [[ventas], [pendientes], [clientes], bajoStock] = await Promise.all([
      query("SELECT COALESCE(SUM(total),0) AS total, COUNT(*) AS n FROM orders WHERE status <> 'cancelado' AND created_at >= NOW() - INTERVAL 30 DAY"),
      query("SELECT COUNT(*) AS n FROM orders WHERE status IN ('pendiente','preparando')"),
      query('SELECT COUNT(*) AS n FROM users'),
      query('SELECT id, ref, name, stock FROM products WHERE stock < 10 ORDER BY stock, name'),
    ]);
    res.json({
      ventas30: ventas.total, pedidos30: ventas.n, porPreparar: pendientes.n, clientes: clientes.n,
      bajoStock: bajoStock.map((p) => ({ id: p.id, ref: p.ref, nombre: p.name, stock: p.stock })),
    });
  } catch (err) { next(err); }
});

router.get('/pedidos', async (req, res, next) => {
  try {
    const rows = await query(`
      SELECT o.id, o.status, o.total, o.created_at, u.name, u.email
      FROM orders o JOIN users u ON u.id = o.user_id ORDER BY o.created_at DESC LIMIT 200`);
    res.json(rows.map((o) => ({ id: o.id, estado: o.status, total: o.total, fecha: o.created_at, cliente: o.name, email: o.email })));
  } catch (err) { next(err); }
});

router.get('/pedidos/:id', async (req, res, next) => {
  try {
    const o = await orderDetail(Number(req.params.id));
    if (!o) return res.status(404).json({ error: 'Pedido no encontrado' });
    res.json(o);
  } catch (err) { next(err); }
});

router.patch('/pedidos/:id', async (req, res, next) => {
  try {
    const estado = req.body?.estado;
    if (!ESTADOS.includes(estado)) return res.status(400).json({ error: 'Estado no válido' });
    const r = await query('UPDATE orders SET status = ? WHERE id = ?', [estado, Number(req.params.id)]);
    if (!r.affectedRows) return res.status(404).json({ error: 'Pedido no encontrado' });
    await logActivity(req, 'admin_estado', `pedido ${req.params.id} -> ${estado}`);
    res.json({ ok: true });
  } catch (err) { next(err); }
});

router.patch('/productos/:id', async (req, res, next) => {
  try {
    const precio = Number(req.body?.precio);
    const stock = Number(req.body?.stock);
    if (!(precio > 0 && precio < 100000) || !Number.isInteger(stock) || stock < 0) {
      return res.status(400).json({ error: 'Precio o stock no válidos' });
    }
    const r = await query('UPDATE products SET price = ?, stock = ? WHERE id = ?', [precio, stock, Number(req.params.id)]);
    if (!r.affectedRows) return res.status(404).json({ error: 'Producto no encontrado' });
    await logActivity(req, 'admin_producto', `producto ${req.params.id}`);
    res.json({ ok: true });
  } catch (err) { next(err); }
});

module.exports = router;
