import { useEffect, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { api, useApi } from '../api.js'
import Dibujo from '../components/Dibujo.jsx'
import { Aviso, Campo, useEnvio } from '../components/Formulario.jsx'
import { euros } from '../data/catalogo.js'
import { comoDataUrl } from '../leerArchivo.js'
import { useSesion } from '../sesion.jsx'

export const fecha = (f) => new Date(f).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })
export const ESTADO = { pendiente: 'Pendiente de pago', preparando: 'Preparando', enviado: 'Enviado', entregado: 'Entregado', cancelado: 'Cancelado' }

export function Protegida({ children, rol }) {
  const { usuario } = useSesion()
  if (usuario === undefined) return <main id="contenido" className="pagina"><p className="listado__n">Cargando…</p></main>
  if (!usuario) return <Navigate to={`/entrar?volver=${encodeURIComponent(location.pathname)}`} replace />
  if (rol && usuario.rol !== rol) return <Navigate to="/" replace />
  return children
}

function Datos() {
  const { data } = useApi('/cuenta')
  const [error, setError] = useState('')
  const [ok, setOk] = useState('')
  const guardar = useEnvio(async (f) => {
    setOk('')
    const d = await api('/cuenta', { method: 'PUT', body: JSON.stringify(Object.fromEntries(f)) })
    setOk(d.mensaje)
  }, setError)
  if (!data) return null
  return (
    <form onSubmit={guardar} className="form">
      <h2 className="seccion-titulo">Tus datos</h2>
      <Avatar inicial={data.avatar} nombre={data.nombre} />
      <Aviso>{error}</Aviso><Aviso tipo="ok">{ok}</Aviso>
      <Campo id="email-ro" label="Email" value={data.email} readOnly />
      <Campo id="nombre" label="Nombre y apellidos" defaultValue={data.nombre} autoComplete="name" required />
      <Campo id="telefono" label="Teléfono" type="tel" defaultValue={data.telefono || ''} autoComplete="tel" />
      <Campo id="direccion" label="Dirección de entrega" defaultValue={data.direccion || ''} autoComplete="street-address" />
      <button type="submit" className="tirador">Guardar datos</button>
    </form>
  )
}

function Avatar({ inicial, nombre }) {
  const { refrescar } = useSesion()
  const [url, setUrl] = useState(inicial)
  const [desdeUrl, setDesdeUrl] = useState('')
  const [error, setError] = useState('')
  const subir = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setError('')
    try {
      const d = await api('/cuenta/avatar', { method: 'PUT', body: JSON.stringify({ imagen: await comoDataUrl(file) }) })
      setUrl(d.avatar); refrescar()
    } catch (err) { setError(err.message) }
    e.target.value = ''
  }
  const traerUrl = async (e) => {
    e.preventDefault()
    if (!desdeUrl.trim()) return
    setError('')
    try {
      const d = await api('/cuenta/avatar', { method: 'PUT', body: JSON.stringify({ url: desdeUrl.trim() }) })
      setUrl(d.avatar); refrescar(); setDesdeUrl('')
    } catch (err) { setError(err.message) }
  }
  return (
    <div className="avatar">
      {url ? <img src={url} alt="" className="avatar__img" /> : <span className="avatar__img avatar__img--vacio" aria-hidden="true">{nombre[0]}</span>}
      <label className="enlace-boton">{url ? 'Cambiar foto' : 'Añadir foto'}
        <input type="file" accept="image/jpeg,image/png,image/webp" onChange={subir} className="visually-hidden" />
      </label>
      <div className="avatar__url">
        <label htmlFor="avatar-url" className="visually-hidden">Dirección de la imagen</label>
        <input id="avatar-url" type="text" placeholder="…o pega la dirección de una foto" value={desdeUrl}
          onChange={(e) => setDesdeUrl(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); traerUrl(e) } }} />
        <button type="button" className="enlace-boton" onClick={traerUrl}>Traer</button>
      </div>
      <Aviso>{error}</Aviso>
    </div>
  )
}

function CambioPassword() {
  const [error, setError] = useState('')
  const [ok, setOk] = useState('')
  const enviar = useEnvio(async (f) => {
    setOk('')
    const d = await api('/cuenta/password', { method: 'PUT', body: JSON.stringify({ actual: f.get('actual'), nueva: f.get('nueva') }) })
    setOk(d.mensaje)
  }, setError)
  return (
    <form onSubmit={enviar} className="form">
      <h2 className="seccion-titulo">Contraseña</h2>
      <Aviso>{error}</Aviso><Aviso tipo="ok">{ok}</Aviso>
      <Campo id="actual" label="Contraseña actual" type="password" autoComplete="current-password" required />
      <Campo id="nueva" label="Contraseña nueva" type="password" autoComplete="new-password" minLength={10} required
        ayuda="Al menos 10 caracteres, con letras y números." />
      <button type="submit" className="tirador">Cambiar contraseña</button>
    </form>
  )
}

function CambioEmail() {
  const { data } = useApi('/cuenta')
  const { refrescar } = useSesion()
  const [error, setError] = useState('')
  const [ok, setOk] = useState('')
  const enviar = useEnvio(async (f) => {
    setOk('')
    const d = await api('/cuenta/email', { method: 'POST', body: JSON.stringify({ email: f.get('email') }) })
    setOk(d.mensaje); await refrescar()
  }, setError)
  if (!data) return null
  return (
    <form onSubmit={enviar} className="form">
      <h2 className="seccion-titulo">Email de la cuenta</h2>
      <Aviso>{error}</Aviso><Aviso tipo="ok">{ok}</Aviso>
      <Campo id="email" label="Email" type="email" defaultValue={data.email} autoComplete="email" required />
      <button type="submit" className="tirador">Cambiar email</button>
    </form>
  )
}

function Preferencias() {
  const { data } = useApi('/cuenta')
  const [error, setError] = useState('')
  const [ok, setOk] = useState('')
  const [newsletter, setNewsletter] = useState(false)
  const [vista, setVista] = useState('cuadricula')
  useEffect(() => {
    if (data?.preferencias) {
      setNewsletter(!!data.preferencias.newsletter)
      setVista(data.preferencias.vista || 'cuadricula')
    }
  }, [data])
  const guardar = async (e) => {
    e.preventDefault()
    setError(''); setOk('')
    try {
      await api('/cuenta/preferencias', { method: 'PUT', body: JSON.stringify({ newsletter, vista }) })
      setOk('Preferencias guardadas')
    } catch (err) { setError(err.message) }
  }
  if (!data) return null
  return (
    <form onSubmit={guardar} className="form">
      <h2 className="seccion-titulo">Preferencias</h2>
      <Aviso>{error}</Aviso><Aviso tipo="ok">{ok}</Aviso>
      <label className="interruptor">
        <input type="checkbox" checked={newsletter} onChange={(e) => setNewsletter(e.target.checked)} />
        <span>Recibir ofertas de la semana por email</span>
      </label>
      <label className="selector">Vista del catálogo
        <select value={vista} onChange={(e) => setVista(e.target.value)}>
          <option value="cuadricula">Cuadrícula</option>
          <option value="lista">Lista</option>
        </select>
      </label>
      <button type="submit" className="tirador">Guardar preferencias</button>
    </form>
  )
}

export function Cuenta() {
  const { usuario, salir } = useSesion()
  const { data: pedidos } = useApi('/pedidos')
  return (
    <main id="contenido" className="pagina">
      <div className="pagina__cabeza">
        <h1>Hola, {usuario.nombre.split(' ')[0]}</h1>
        <button type="button" className="enlace-boton" onClick={salir}>Cerrar sesión</button>
      </div>
      <div className="cuenta">
        <section className="panel" aria-labelledby="pedidos-t">
          <h2 id="pedidos-t" className="seccion-titulo">Tus pedidos</h2>
          {pedidos?.length === 0 && <p>Aún no has hecho ningún pedido. <Link to="/">Ver ofertas de la semana</Link></p>}
          <ul className="pedidos">
            {pedidos?.map((p) => (
              <li key={p.id}>
                <Link to={`/cuenta/pedidos/${p.id}`} className="pedido-fila">
                  <span className="ref">Pedido {p.id}</span>
                  <span>{fecha(p.fecha)} · {p.lineas} {p.lineas === 1 ? 'artículo' : 'artículos'}</span>
                  <span className={`estado estado--${p.estado}`}>{ESTADO[p.estado]}</span>
                  <b>{euros(p.total)}</b>
                </Link>
              </li>
            ))}
          </ul>
        </section>
        <div className="panel"><Datos /></div>
        <div className="panel"><CambioEmail /></div>
        <div className="panel"><CambioPassword /></div>
        <div className="panel"><Preferencias /></div>
      </div>
    </main>
  )
}

export function DetallePedido({ admin = false }) {
  const { id } = useParams()
  const { data: p, error } = useApi(admin ? `/admin/pedidos/${id}` : `/pedidos/${id}`)
  const [estado, setEstado] = useState('')
  const [msg, setMsg] = useState('')
  useEffect(() => { if (p) setEstado(p.estado) }, [p])

  if (error) return <main id="contenido" className="pagina"><h1>Pedido no encontrado</h1><p><Link to={admin ? '/admin' : '/cuenta'}>Volver</Link></p></main>
  if (!p) return <main id="contenido" className="pagina"><p className="listado__n">Cargando…</p></main>

  const cambiar = async (e) => {
    const v = e.target.value
    setEstado(v); setMsg('')
    try { await api(`/admin/pedidos/${id}`, { method: 'PATCH', body: JSON.stringify({ estado: v }) }); setMsg('Estado actualizado') }
    catch (err) { setMsg(err.message) }
  }

  return (
    <main id="contenido" className="pagina">
      <p className="miga"><Link to={admin ? '/admin' : '/cuenta'}>{admin ? 'Administración' : 'Mi cuenta'}</Link> / Pedido {p.id}</p>
      <div className="pagina__cabeza">
        <h1>Pedido {p.id}</h1>
        {admin ? (
          <label className="selector">Estado
            <select value={estado} onChange={cambiar}>{Object.entries(ESTADO).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
          </label>
        ) : <span className={`estado estado--${p.estado}`}>{ESTADO[p.estado]}</span>}
      </div>
      <Aviso tipo="ok">{msg}</Aviso>
      <div className="resumen-pedido">
        <ul className="lineas">
          {p.lineas.map((l) => (
            <li key={l.id} className="linea">
              <Dibujo tipo={l.dibujo} className="linea__dibujo" />
              <span><Link to={`/producto/${l.id}`}>{l.nombre}</Link><span className="ref">REF {l.ref}</span></span>
              <span>{l.cantidad} × {euros(l.precio)}</span>
              <b>{euros(l.cantidad * l.precio)}</b>
            </li>
          ))}
        </ul>
        <dl className="datos-pedido">
          <dt>Fecha</dt><dd>{fecha(p.fecha)}</dd>
          <dt>Entrega en</dt><dd>{p.direccion}</dd>
          {p.tarjeta && <><dt>Pago</dt><dd>Tarjeta acabada en {p.tarjeta}</dd></>}
          {p.cupon && <><dt>Cupón</dt><dd>{p.cupon}</dd></>}
          <dt>Total</dt><dd className="datos-pedido__total">{euros(p.total)}</dd>
        </dl>
      </div>
    </main>
  )
}
