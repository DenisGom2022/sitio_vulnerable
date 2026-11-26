import { Link } from 'react-router-dom'
import Cajon from '../components/Cajon.jsx'
import { Camion, Documento, Llave, Mostrador } from '../components/Iconos.jsx'
import { useApi } from '../api.js'

const miles = (n) => n.toLocaleString('es-ES')

export default function Home() {
  const { data: categorias } = useApi('/categorias')
  const { data: productos, error } = useApi('/portada')
  const estrella = productos?.find((p) => p.destacado)
  const resto = productos?.filter((p) => !p.destacado) || []

  return (
    <main id="contenido">
      <div className="cajonera">
        <nav className="secciones" aria-busy={!categorias} aria-label="Secciones de la tienda">
          <h2 className="visually-hidden">Secciones</h2>
          <ul>
            {(categorias || []).map((c) => (
              <li key={c.slug}>
                <Link to={`/categoria/${c.slug}`} className="cajoncito">
                  <span className="portaetiquetas portaetiquetas--seccion">
                    <span className="etiqueta">{c.nombre}</span>
                    <span className="ref">{c.ref} · {miles(c.articulos)} ref.</span>
                  </span>
                  <span className="cajoncito__tirador" aria-hidden="true" />
                </Link>
              </li>
            ))}
            <li>
              <Link to="/profesionales" className="cajoncito cajoncito--pro">
                <span className="portaetiquetas portaetiquetas--seccion">
                  <span className="etiqueta">Profesionales</span>
                  <span className="ref">08 · precios de oficio</span>
                </span>
                <span className="cajoncito__tirador" aria-hidden="true" />
              </Link>
            </li>
          </ul>
        </nav>

        <section className="ofertas" aria-labelledby="ofertas-titulo">
          <h1 id="ofertas-titulo" className="visually-hidden">Ofertas de la semana en Tornillo Mayor</h1>
          {error && <p className="aviso-error">No hemos podido cargar las ofertas. Recarga la página en unos segundos.</p>}
          {!productos && !error && Array.from({ length: 9 }, (_, i) => (
            <div key={i} className={`cajon cajon--vacio${i === 0 ? ' cajon--grande' : ''}`} aria-hidden="true" />
          ))}
          {estrella && <Cajon p={estrella} grande />}
          {resto.map((p) => <Cajon key={p.id} p={p} />)}
        </section>
      </div>

      <section className="pro" aria-labelledby="pro-titulo">
        <div className="pro__frente">
          <div className="pro__texto">
            <div className="portaetiquetas">
            <h2 id="pro-titulo">Si vives de la obra, abre tu cuenta profesional.</h2>
            <p>
              Fontaneros, electricistas y empresas de reformas compran aquí con su tarifa de oficio.
              Pasa el presupuesto de tu programa de obra a pedido sin teclear línea a línea.
            </p>
            <Link to="/profesionales" className="boton-chapa">Abrir cuenta profesional</Link>
            </div>
          </div>
          <ul className="pro__ventajas">
            <li><Documento /><span><b>Importa tu presupuesto en XML</b>Desde Presto, Arquímedes o tu hoja de obra.</span></li>
            <li><Llave /><span><b>Tarifa de profesional</b>Precio neto por volumen en todo el catálogo.</span></li>
            <li><Camion /><span><b>Entrega en obra</b>A primera hora, con albarán valorado.</span></li>
          </ul>
        </div>
      </section>

      <section className="mostrador" aria-labelledby="mostrador-titulo">
        <Mostrador />
        <div>
          <h2 id="mostrador-titulo">Detrás del mostrador desde 1987</h2>
          <p>
            Empezamos con un local de cuarenta metros y una cajonera de tornillería que todavía usamos.
            Si no sabes qué taco pide tu pared o qué sección de cable lleva tu horno, pregúntanos:
            te contesta alguien que ha pasado años despachando.
          </p>
        </div>
        <Link to="/contacto" className="enlace">Escríbenos o llama</Link>
      </section>
    </main>
  )
}
