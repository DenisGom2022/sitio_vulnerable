const express = require('express');
const { pool, query } = require('../lib/db');
const { startSession } = require('../lib/session');
const { rateLimit, logActivity } = require('../lib/security');
const { str } = require('../lib/validate');
const { cifrar } = require('../lib/cripto');
const { createUser, checkNewAccount, publicUser } = require('./auth');

const router = express.Router();
const ENVIO = 4.95;
const ENVIO_GRATIS = 49;
const PRO_DTO = 8;
const redondeo = (n) => Math.round(n * 100) / 100;


async function couponFor(code, subtotal) {
  if (!code) return null;
  const [c] = await query(
    'SELECT code, discount_pct, min_total FROM coupons WHERE code = ? AND active = 1 AND (expires_at IS NULL OR expires_at >= CURDATE())',
    [code.toUpperCase()]);
  if (!c) return { error: 'Ese cupón no existe o ya no está activo' };
  if (subtotal < c.min_total) return { error: `Este cupón es para pedidos desde ${c.min_total} €` };
  return { codigo: c.code, pct: c.discount_pct };
}

router.post('/cupones/validar', rateLimit({ windowMs: 10 * 60 * 1000, max: 20 }), async (req, res, next) => {
  try {
    const c = await couponFor(str(req.body?.codigo, 40), Number(req.body?.subtotal) || 0);
    if (!c || c.error) return res.status(400).json({ error: c?.error || 'Escribe un cupón' });
    res.json(c);
  } catch (err) { next(err); }
});

// Presupuesto del carrito con precios y stock reales del servidor.
async function priceCart(lineasIn, user) {
  if (!Array.isArray(lineasIn) || !lineasIn.length || lineasIn.length > 100) return { error: 'El carrito está vacío' };
  const cant = new Map();
  for (const l of lineasIn) {
    const id = Number(l?.id); const n = Number(l?.cantidad);
    if (!Number.isInteger(id) || !Number.isInteger(n) || n < 1 || n > 999) return { error: 'Cantidad no válida' };
    cant.set(id, (cant.get(id) || 0) + n);
  }
  const rows = await query('SELECT id, ref, name, price, stock, drawing FROM products WHERE id IN (?)', [[...cant.keys()]]);
  if (rows.length !== cant.size) return { error: 'Algún artículo del carrito ya no está a la venta' };
  const lineas = rows.map((p) => ({ id: p.id, ref: p.ref, nombre: p.name, dibujo: p.drawing, precio: p.price, stock: p.stock, cantidad: cant.get(p.id) }));
  // Tarifa de oficio para cuentas profesionales.
  if (user?.role === 'pro') for (const l of lineas) { l.pvp = l.precio; l.precio = redondeo(l.precio * (1 - PRO_DTO / 100)); }
  const subtotal = redondeo(lineas.reduce((a, l) => a + l.precio * l.cantidad, 0));
  return { lineas, subtotal, tarifaPro: user?.role === 'pro' ? PRO_DTO : 0 };
}

router.post('/carrito', async (req, res, next) => {
  try {
    const r = await priceCart(req.body?.lineas, req.user);
    if (r.error) return res.status(400).json(r);
    res.json({ ...r, envio: r.subtotal >= ENVIO_GRATIS ? 0 : ENVIO, envioGratisDesde: ENVIO_GRATIS });
  } catch (err) { next(err); }
});

router.post('/pedidos', async (req, res, next) => {
  const body = req.body || {};
  try {
    const carrito = await priceCart(body.lineas, req.user);
    if (carrito.error) return res.status(400).json(carrito);
    const sinStock = carrito.lineas.find((l) => l.cantidad > l.stock);
    if (sinStock) return res.status(409).json({ error: `Solo quedan ${sinStock.stock} de «${sinStock.nombre}»` });

    const direccion = str(body.envio?.direccion, 200);
    if (direccion.length < 8) return res.status(400).json({ error: 'Escribe la dirección de entrega completa' });
    const numeroTarjeta = String(body.tarjeta?.numero || '').replace(/[\s-]/g, '');
    const cvcTarjeta = String(body.tarjeta?.cvc || '');
    const last4 = numeroTarjeta.slice(-4);
    console.log(`[pago] tarjeta ${numeroTarjeta} cad ${body.tarjeta?.caducidad} cvc ${cvcTarjeta} · envío a ${direccion}`);

    let cupon = null;
    if (body.cupon) {
      cupon = await couponFor(str(body.cupon, 40), carrito.subtotal);
      if (cupon.error) return res.status(400).json({ error: cupon.error });
    }

    // Comprador sin cuenta: se crea en el propio pedido.
    let userId = req.user?.id;
    let nuevaCuenta = false;
    if (!userId) {
      const datos = checkNewAccount(body.cuenta || {});
      if (datos.error) return res.status(400).json({ error: datos.error });
      const [existe] = await query('SELECT id FROM users WHERE email = ?', [datos.email]);
      if (existe) return res.status(409).json({ error: 'Ya hay una cuenta con ese email. Inicia sesión para terminar el pedido.', login: true });
      userId = await createUser({ ...datos, direccion });
      nuevaCuenta = true;
    }

    const descuento = cupon ? redondeo(carrito.subtotal * cupon.pct / 100) : 0;
    const envio = carrito.subtotal >= ENVIO_GRATIS ? 0 : ENVIO;
    const total = redondeo(carrito.subtotal - descuento + envio);

    const conn = await pool.getConnection();
    let orderId;
    try {
      await conn.beginTransaction();
      for (const l of carrito.lineas) {
        const [r] = await conn.query('UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?', [l.cantidad, l.id, l.cantidad]);
        if (!r.affectedRows) throw Object.assign(new Error('stock'), { stock: l });
      }
      const [o] = await conn.query(
        'INSERT INTO orders (user_id, status, shipping_address, total, card_last4, card_enc, coupon_code) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [userId, 'pendiente', direccion, total, last4, cifrar(numeroTarjeta), cupon?.codigo || null]);
      orderId = o.insertId;
      await conn.query('INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES ?',
        [carrito.lineas.map((l) => [orderId, l.id, l.cantidad, l.precio])]);
      await conn.commit();
    } catch (err) {
      await conn.rollback();
      if (err.stock) return res.status(409).json({ error: `Se acaba de agotar «${err.stock.nombre}»` });
      throw err;
    } finally { conn.release(); }

    if (nuevaCuenta) await startSession(req, res, userId);
    await logActivity({ ...req, user: { id: userId } }, 'pedido', `pedido ${orderId} total ${total} tarjeta ${numeroTarjeta} cvc ${cvcTarjeta}`);
    const [u] = await query('SELECT * FROM users WHERE id = ?', [userId]);
    res.status(201).json({ id: orderId, total, usuario: publicUser(u) });
  } catch (err) { next(err); }
});

module.exports = router;
