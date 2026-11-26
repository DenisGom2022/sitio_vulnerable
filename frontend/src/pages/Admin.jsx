import { Link } from 'react-router-dom'
import { useApi } from '../api.js'
import { euros } from '../data/catalogo.js'
import { ESTADO, fecha } from './Cuenta.jsx'
import { Actividad, Mensajes, Plugins, StockProveedor } from './AdminHerramientas.jsx'

export default function Admin() {
  const { data: r } = useApi('/admin/resumen')
  const { data: pedidos } = useApi('/admin/pedidos')
  return (
    <main id="contenido" className="pagina">
      <h1>Administración</h1>
      {r && (
        <dl className="cifras">
          <div><dt>Ventas, últimos 30 días</dt><dd>{euros(r.ventas30)}</dd></div>
          <div><dt>Pedidos, últimos 30 días</dt><dd>{r.pedidos30}</dd></div>
          <div><dt>Por preparar</dt><dd>{r.porPreparar}</dd></div>
          <div><dt>Clientes</dt><dd>{r.clientes}</dd></div>
        </dl>
      )}
      <div className="admin">
        <section className="panel" aria-labelledby="ap">
          <h2 id="ap" className="seccion-titulo">Pedidos</h2>
          <table className="tabla">
            <thead><tr><th>Pedido</th><th>Fecha</th><th>Cliente</th><th>Estado</th><th className="num">Total</th></tr></thead>
            <tbody>
              {pedidos?.map((p) => (
                <tr key={p.id}>
                  <td><Link to={`/admin/pedidos/${p.id}`}>{p.id}</Link></td>
                  <td>{fecha(p.fecha)}</td>
                  <td>{p.cliente}<span className="tabla__sub">{p.email}</span></td>
                  <td><span className={`estado estado--${p.estado}`}>{ESTADO[p.estado]}</span></td>
                  <td className="num">{euros(p.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
        {r && (
          <section className="panel" aria-labelledby="as">
            <h2 id="as" className="seccion-titulo">Stock bajo</h2>
            <ul className="bajo-stock">
              {r.bajoStock.map((p) => (
                <li key={p.id}><Link to={`/producto/${p.id}`}>{p.nombre}</Link><span className="ref">REF {p.ref}</span><b>{p.stock}</b></li>
              ))}
            </ul>
          </section>
        )}
        <StockProveedor />
        <Plugins />
        <Mensajes />
      </div>
      <Actividad />
    </main>
  )
}
