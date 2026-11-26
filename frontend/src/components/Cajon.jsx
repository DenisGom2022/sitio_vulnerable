import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Dibujo from './Dibujo.jsx'
import { euros } from '../data/catalogo.js'
import { useCarrito } from '../carrito.jsx'

export default function Cajon({ p, grande = false }) {
  const { lineas, anadir } = useCarrito()
  const [cerrando, setCerrando] = useState(false)
  const t = useRef()
  const enCarrito = lineas[p.id] || 0
  const agotado = p.stock === 0
  const rebaja = p.antes ? Math.round((1 - p.precio / p.antes) * 100) : 0

  const meter = () => {
    anadir(p.id)
    setCerrando(true)
    clearTimeout(t.current)
    t.current = setTimeout(() => setCerrando(false), 420)
  }

  const clases = ['cajon', grande && 'cajon--grande', agotado && 'is-agotado', enCarrito && 'is-marcado', cerrando && 'is-cerrando']
    .filter(Boolean).join(' ')

  return (
    <article className={clases} aria-labelledby={`p-${p.id}`}>
      <div className="cajon__hueco">
        <Dibujo tipo={p.dibujo} className="cajon__dibujo" />
        {rebaja > 0 && !agotado && <span className="pegatina">−{rebaja} %</span>}
      </div>

      <div className="cajon__frente">
        <div className="portaetiquetas">
          <h3 id={`p-${p.id}`} className="etiqueta">
            <Link to={`/producto/${p.id}`}>{p.nombre}</Link>
          </h3>
          <span className="ref"><span className="ref__codigo">REF {p.ref}</span>{agotado && ' · agotado'}</span>
          {grande && <p className="cajon__detalle">{p.detalle}</p>}
          <svg className="marca" viewBox="0 0 200 12" preserveAspectRatio="none" aria-hidden="true">
            <path pathLength="1" d="M3 8 C 50 4, 120 10, 197 5" />
          </svg>
        </div>

        <div className="cajon__compra">
          <p className="precio">
            <span className="visually-hidden">Precio: </span>{euros(p.precio)}
            {p.antes && <s className="precio__antes"><span className="visually-hidden">antes </span>{euros(p.antes)}</s>}
          </p>
          {agotado ? (
            <button type="button" className="tirador" disabled>Sin existencias</button>
          ) : (
            <button type="button" className="tirador" onClick={meter} aria-describedby={`p-${p.id}`}>
              {enCarrito ? `Añadir otro (${enCarrito})` : 'Añadir al carrito'}
            </button>
          )}
        </div>
      </div>
      {grande && !agotado && <p className="cajon__stock">{p.stock} en almacén · envío en 24/48 h</p>}
    </article>
  )
}
