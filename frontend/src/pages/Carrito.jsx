import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api.js'
import Dibujo from '../components/Dibujo.jsx'
import { Aviso } from '../components/Formulario.jsx'
import { euros } from '../data/catalogo.js'
import { useCarrito } from '../carrito.jsx'

// Pide al servidor precios y stock actuales del carrito.
export function usePresupuesto() {
  const { paraApi, vaciar } = useCarrito()
  const clave = JSON.stringify(paraApi)
  const [estado, setEstado] = useState({ data: null, error: '' })
  useEffect(() => {
    if (!paraApi.length) { setEstado({ data: null, error: '' }); return }
    let vivo = true
    api('/carrito', { method: 'POST', body: JSON.stringify({ lineas: paraApi }) })
      .then((data) => vivo && setEstado({ data, error: '' }))
      .catch((e) => {
        if (!vivo) return
        if (e.status === 400) vaciar()
        setEstado({ data: null, error: e.message })
      })
    return () => { vivo = false }
  }, [clave]) // eslint-disable-line react-hooks/exhaustive-deps
  return estado
}

export default function Carrito() {
  const { paraApi, fijar } = useCarrito()
  const { data, error } = usePresupuesto()

  if (!paraApi.length) {
    return (
      <main id="contenido" className="pagina">
        <h1>Tu carrito</h1>
        <Aviso>{error}</Aviso>
        <p className="vacio">Está vacío. <Link to="/">Mira las ofertas de la semana</Link> o busca lo que necesitas.</p>
      </main>
    )
  }

  return (
    <main id="contenido" className="pagina">
      <h1>Tu carrito</h1>
      <Aviso>{error}</Aviso>
      {data && (
        <div className="carrito">
          <ul className="lineas">
            {data.lineas.map((l) => (
              <li key={l.id} className="linea">
                <Dibujo tipo={l.dibujo} className="linea__dibujo" />
                <span><Link to={`/producto/${l.id}`}>{l.nombre}</Link><span className="ref">REF {l.ref}</span>
                  {l.cantidad > l.stock && <span className="linea__aviso">{l.stock ? `Solo quedan ${l.stock}` : 'Agotado'}</span>}
                </span>
                <span className="cantidad cantidad--fila">
                  <button type="button" aria-label={`Quitar una unidad de ${l.nombre}`} onClick={() => fijar(l.id, l.cantidad - 1)}>−</button>
                  <output aria-live="polite">{l.cantidad}</output>
                  <button type="button" aria-label={`Añadir una unidad de ${l.nombre}`} onClick={() => fijar(l.id, l.cantidad + 1)} disabled={l.cantidad >= l.stock}>+</button>
                </span>
                <b>{euros(l.precio * l.cantidad)}</b>
                <button type="button" className="enlace-boton" onClick={() => fijar(l.id, 0)}>Quitar</button>
              </li>
            ))}
          </ul>
          <aside className="totales panel">
            {data.tarifaPro > 0 && <p className="totales__nota">Precios con tu tarifa profesional (−{data.tarifaPro} %).</p>}
            <dl>
              <dt>Subtotal</dt><dd>{euros(data.subtotal)}</dd>
              <dt>Envío</dt><dd>{data.envio ? euros(data.envio) : 'Gratis'}</dd>
              <dt className="totales__total">Total</dt><dd className="totales__total">{euros(data.subtotal + data.envio)}</dd>
            </dl>
            {data.envio > 0 && <p className="totales__nota">Te faltan {euros(data.envioGratisDesde - data.subtotal)} para el envío gratis.</p>}
            <Link to="/pedido" className="tirador tirador--ancho tirador--enlace">Tramitar pedido</Link>
          </aside>
        </div>
      )}
    </main>
  )
}
