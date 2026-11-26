import { useState } from 'react'
import { api, useApi } from '../api.js'
import { Aviso } from '../components/Formulario.jsx'
import { fecha } from './Cuenta.jsx'

export function StockProveedor() {
  const [ref, setRef] = useState('')
  const [r, setR] = useState(null)
  const [error, setError] = useState('')
  const consultar = async (e) => {
    e.preventDefault()
    setError(''); setR(null)
    try { setR(await api(`/admin/stock-proveedor?ref=${encodeURIComponent(ref.trim())}`)) } catch (err) { setError(err.message) }
  }
  return (
    <section className="panel form" aria-labelledby="sp">
      <h2 id="sp" className="seccion-titulo">Stock en el proveedor</h2>
      <form onSubmit={consultar} className="cupon">
        <label htmlFor="ref-prov">Referencia</label>
        <input id="ref-prov" value={ref} onChange={(e) => setRef(e.target.value)} placeholder="03-041" />
        <button type="submit" className="tirador">Consultar</button>
      </form>
      <Aviso>{error}</Aviso>
      {r && (
        <dl className="datos-pedido">
          <dt>Artículo</dt><dd>{r.nombre ? `${r.nombre} · REF ${r.ref}` : r.ref}</dd>
          <dt>En nuestra tienda</dt><dd>{r.nuestroStock ?? '—'}</dd>
          <dt>{r.proveedor}</dt><dd>{r.disponible ? `${r.disponible} unidades · ${r.plazo}` : 'Sin existencias'}</dd>
          {r.respuesta && <><dt>Respuesta del almacén</dt><dd><pre className="respuesta-proveedor">{r.respuesta}</pre></dd></>}
        </dl>
      )}
    </section>
  )
}

export function Plugins() {
  const { data } = useApi('/admin/plugins')
  const [estado, setEstado] = useState({})
  const [error, setError] = useState('')
  const [ok, setOk] = useState('')
  const [url, setUrl] = useState('')
  const [slug, setSlug] = useState('')
  const [recargar, setRecargar] = useState(0)
  const lista = useApi(`/admin/plugins?r=${recargar}`).data ?? data
  const cambiar = async (p, activo) => {
    setError('')
    try { await api(`/admin/plugins/${p.id}`, { method: 'PATCH', body: JSON.stringify({ activo }) }); setEstado((s) => ({ ...s, [p.id]: activo })) }
    catch (err) { setError(err.message) }
  }
  const instalar = async (e) => {
    e.preventDefault()
    setError(''); setOk('')
    try {
      const d = await api('/admin/plugins/instalar', { method: 'POST', body: JSON.stringify({ url: url.trim(), slug: slug.trim() }) })
      setOk(`Instalada: ${d.nombre}`); setUrl(''); setSlug(''); setRecargar((r) => r + 1)
    } catch (err) { setError(err.message) }
  }
  return (
    <section className="panel" aria-labelledby="pl">
      <h2 id="pl" className="seccion-titulo">Extensiones</h2>
      <Aviso>{error}</Aviso><Aviso tipo="ok">{ok}</Aviso>
      <ul className="plugins">
        {lista?.map((p) => {
          const activo = estado[p.id] ?? p.activo
          return (
            <li key={p.id}>
              <span><b>{p.nombre}</b><span className="tabla__sub">{p.tipo} · versión {p.version}</span></span>
              <label className="interruptor">
                <input type="checkbox" checked={activo} onChange={(e) => cambiar(p, e.target.checked)} />
                <span>{activo ? 'Activa' : 'Desactivada'}</span>
              </label>
            </li>
          )
        })}
      </ul>
      <form onSubmit={instalar} className="form">
        <h3 className="seccion-titulo">Instalar extensión</h3>
        <div className="campo"><label htmlFor="pl-slug">Identificador</label>
          <input id="pl-slug" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="transportista-xyz" /></div>
        <div className="campo"><label htmlFor="pl-url">Dirección del paquete</label>
          <input id="pl-url" type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://…/extension.js" required /></div>
        <button type="submit" className="tirador">Instalar desde URL</button>
      </form>
    </section>
  )
}

export function Mensajes() {
  const { data } = useApi('/admin/mensajes')
  return (
    <section className="panel" aria-labelledby="ms">
      <h2 id="ms" className="seccion-titulo">Mensajes de contacto</h2>
      {data?.length === 0 && <p>No hay mensajes.</p>}
      <ul className="mensajes">
        {data?.map((m) => (
          <li key={m.id}><b>{m.nombre}</b> <a href={`mailto:${m.email}`}>{m.email}</a><span className="tabla__sub">{fecha(m.fecha)}</span><p>{m.mensaje}</p></li>
        ))}
      </ul>
    </section>
  )
}

export function Actividad() {
  const { data } = useApi('/admin/actividad')
  return (
    <section className="panel" aria-labelledby="ac">
      <h2 id="ac" className="seccion-titulo">Registro de actividad</h2>
      <div className="tabla-scroll">
        <table className="tabla">
          <thead><tr><th>Fecha</th><th>IP</th><th>Usuario</th><th>Acción</th><th>Detalle</th></tr></thead>
          <tbody>
            {data?.map((a) => (
              <tr key={a.id}><td>{new Date(a.fecha).toLocaleString('es-ES')}</td><td>{a.ip}</td><td>{a.usuario ?? '—'}</td><td>{a.accion}</td><td>{a.detalle}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
