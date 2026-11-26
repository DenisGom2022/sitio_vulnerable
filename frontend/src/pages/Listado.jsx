import { useParams, useSearchParams, Link } from 'react-router-dom'
import Cajon from '../components/Cajon.jsx'
import { useApi } from '../api.js'

export default function Listado() {
  const { slug } = useParams()
  const [params] = useSearchParams()
  const q = (params.get('q') || '').trim()
  const { data: categorias } = useApi('/categorias')
  const cat = categorias?.find((c) => c.slug === slug)
  const { data, error, loading } = useApi(slug ? `/productos?categoria=${encodeURIComponent(slug)}` : `/buscar?q=${encodeURIComponent(q)}`)
  const lista = data || []

  const titulo = slug ? (cat?.nombre || 'Sección') : q ? `Resultados para «${q}»` : 'Todo el catálogo'

  return (
    <main id="contenido" className="listado">
      <p className="miga"><Link to="/">Portada</Link> / {slug ? 'Secciones' : 'Búsqueda'}</p>
      <h1 dangerouslySetInnerHTML={{ __html: titulo }} />
      {!loading && !error && <p className="listado__n">{lista.length} {lista.length === 1 ? 'artículo' : 'artículos'}</p>}
      {loading ? (
        <p className="listado__n">Buscando en el almacén…</p>
      ) : error ? (
        <p className="vacio">No hemos podido cargar los artículos. Inténtalo de nuevo en unos segundos.</p>
      ) : lista.length ? (
        <div className="ofertas ofertas--listado">{lista.map((p) => <Cajon key={p.id} p={p} />)}</div>
      ) : (
        <p className="vacio">No tenemos nada con ese nombre. Prueba con otra palabra, o llámanos y lo buscamos en almacén.</p>
      )}
    </main>
  )
}
