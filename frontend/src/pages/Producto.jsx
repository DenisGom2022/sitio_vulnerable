import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api, useApi } from '../api.js'
import Dibujo from '../components/Dibujo.jsx'
import { Aviso, useEnvio } from '../components/Formulario.jsx'
import { euros } from '../data/catalogo.js'
import { useCarrito } from '../carrito.jsx'
import { useSesion } from '../sesion.jsx'
import { fecha } from './Cuenta.jsx'
import { comoDataUrl } from '../leerArchivo.js'

function Estrellas({ n }) {
  return <span className="estrellas" aria-label={`${n} de 5`}>{[1, 2, 3, 4, 5].map((i) => <span key={i} className={i <= n ? 'on' : ''} aria-hidden="true" />)}</span>
}

function NuevaResena({ id, alGuardar }) {
  const [error, setError] = useState('')
  const [puntuacion, setPuntuacion] = useState(5)
  const enviar = useEnvio(async (f) => {
    const r = await api(`/productos/${id}/resenas`, { method: 'POST', body: JSON.stringify({ puntuacion, titulo: f.get('titulo'), texto: f.get('texto') }) })
    const fotos = f.getAll('fotos').filter((x) => x.size).slice(0, 3)
    for (const foto of fotos) {
      await api(`/resenas/${r.id}/fotos`, { method: 'POST', body: JSON.stringify({ imagen: await comoDataUrl(foto), nombre: foto.name }) })
    }
    alGuardar()
  }, setError)
  return (
    <form onSubmit={enviar} className="form panel">
      <h3 className="seccion-titulo">Escribe tu opinión</h3>
      <Aviso>{error}</Aviso>
      <fieldset className="puntuar">
        <legend>Puntuación</legend>
        {[1, 2, 3, 4, 5].map((n) => (
          <label key={n}><input type="radio" name="p" value={n} checked={puntuacion === n} onChange={() => setPuntuacion(n)} />{n}</label>
        ))}
      </fieldset>
      <div className="campo"><label htmlFor="titulo">Título</label><input id="titulo" name="titulo" maxLength={120} required /></div>
      <div className="campo"><label htmlFor="texto">Tu experiencia</label><textarea id="texto" name="texto" rows={4} maxLength={2000} required /></div>
      <div className="campo"><label htmlFor="fotos">Fotos de tu obra (hasta 3, JPG, PNG o WebP)</label>
        <input id="fotos" name="fotos" type="file" accept="image/jpeg,image/png,image/webp" multiple /></div>
      <button type="submit" className="tirador">Publicar opinión</button>
    </form>
  )
}

export default function Producto() {
  const { id } = useParams()
  const [version, setVersion] = useState(0)
  const { data: p, error } = useApi(`/productos/${id}?v=${version}`)
  const { usuario } = useSesion()
  const { lineas, anadir } = useCarrito()
  const [cantidad, setCantidad] = useState(1)

  if (error) return <main id="contenido" className="pagina"><h1>Este artículo ya no está en el catálogo</h1><p><Link to="/">Volver a la portada</Link></p></main>
  if (!p) return <main id="contenido" className="pagina"><p className="listado__n">Cargando…</p></main>

  const media = p.resenas.length ? p.resenas.reduce((a, r) => a + r.puntuacion, 0) / p.resenas.length : 0
  const agotado = p.stock === 0

  return (
    <main id="contenido" className="pagina">
      <p className="miga"><Link to="/">Portada</Link> / <Link to={`/categoria/${p.categoria}`}>Sección</Link></p>
      <article className="producto">
        <div className="producto__hueco"><Dibujo tipo={p.dibujo} className="producto__dibujo" /></div>
        <div className="producto__frente">
          <div className="portaetiquetas producto__etiqueta">
            <h1 className={agotado ? 'tachado' : ''}>{p.nombre}</h1>
            <span className="ref"><span className="ref__codigo">REF {p.ref}</span>{agotado && ' · agotado'}</span>
            {p.resenas.length > 0 && <p className="producto__media"><Estrellas n={Math.round(media)} /> {media.toFixed(1)} · {p.resenas.length} {p.resenas.length === 1 ? 'opinión' : 'opiniones'}</p>}
            <p className="producto__detalle">{p.detalle}</p>
          </div>
          <p className="precio precio--grande">{euros(p.precio)}{p.antes && <s className="precio__antes">{euros(p.antes)}</s>}</p>
          {agotado ? (
            <p className="producto__stock">Sin existencias. Llámanos y te decimos cuándo entra.</p>
          ) : (
            <>
              <div className="comprar">
                <label className="cantidad">Cantidad
                  <input type="number" min={1} max={Math.min(999, p.stock)} value={cantidad}
                    onChange={(e) => setCantidad(Math.max(1, Math.min(p.stock, Number(e.target.value) || 1)))} />
                </label>
                <button type="button" className="tirador tirador--grande" onClick={() => anadir(p.id, cantidad)}>
                  {lineas[p.id] ? `Añadir más (${lineas[p.id]} en el carrito)` : 'Añadir al carrito'}
                </button>
              </div>
              <p className="producto__stock">{p.stock} en almacén · envío en 24/48 h · recogida en tienda en 2 horas</p>
            </>
          )}
        </div>
      </article>

      <section className="resenas" aria-labelledby="resenas-t">
        <h2 id="resenas-t" className="seccion-titulo">Opiniones de clientes</h2>
        {p.resenas.length === 0 && <p>Todavía nadie ha opinado sobre este artículo.</p>}
        <ul>
          {p.resenas.map((r) => (
            <li key={r.id} className="resena">
              <Estrellas n={r.puntuacion} />
              <h3>{r.titulo}</h3>
              <p>{r.texto}</p>
              {r.fotos?.length > 0 && <div className="resena__fotos">{r.fotos.map((u) => <a key={u} href={u} target="_blank" rel="noreferrer"><img src={u} alt={`Foto de ${r.autor}`} loading="lazy" /></a>)}</div>}
              <p className="resena__autor">{r.autor} · {fecha(r.fecha)}</p>
            </li>
          ))}
        </ul>
        {usuario ? <NuevaResena id={p.id} alGuardar={() => setVersion((v) => v + 1)} />
          : <p><Link to={`/entrar?volver=/producto/${p.id}`}>Entra en tu cuenta</Link> para dejar tu opinión.</p>}
      </section>
    </main>
  )
}
