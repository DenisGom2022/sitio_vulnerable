// Forma pública de un producto, la que consume el frontend.
function product(row) {
  return {
    id: row.id,
    ref: row.ref,
    categoria: row.category_slug,
    nombre: row.name,
    detalle: row.description,
    precio: row.price,
    antes: row.old_price,
    stock: row.stock,
    dibujo: row.drawing,
    destacado: row.home_position === 1,
  };
}

module.exports = { product };
