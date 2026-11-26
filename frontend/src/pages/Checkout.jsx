import { useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { api } from '../api.js'
import { Aviso, Campo } from '../components/Formulario.jsx'
import { euros } from '../data/catalogo.js'
import { useCarrito } from '../carrito.jsx'
import { useSesion } from '../sesion.jsx'
import { usePresupuesto } from './Carrito.jsx'

export default function Checkout() {
  const { usuario, setUsuario } = useSesion()
  const { paraApi, vaciar } = useCarrito()
  const { data } = usePresupuesto()
  const [error, setError] = useState('')
  const [cupon, setCupon] = useState(null)
  const [enviando, setEnviando] = useState(false)
  const navigate = useNavigate()

  if (!paraApi.length) return <Navigate to="/carrito" replace />

  const probarCupon = async () => {
    const codigo = document.getElementById('cupon').value.trim()
    setError('')
    try { setCupon(await api('/cupones/validar', { method: 'POST', body: JSON.stringify({ codigo, subtotal: data?.subtotal }) })) }
    catch (e) { setCupon(null); setError(e.message) }
  }

  const enviar = async (e) => {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    setError(''); setEnviando(true)
    try {
      const pedido = await api('/pedidos', {
        method: 'POST',
        body: JSON.stringify({
          lineas: paraApi,
          envio: { direccion: f.get('direccion') },
          tarjeta: { numero: f.get('tarjeta'), caducidad: f.get('caducidad'), cvc: f.get('cvc') },
          cupon: cupon?.codigo,
          cuenta: usuario ? undefined : { nombre: f.get('nombre'), email: f.get('email'), password: f.get('password'), telefono: f.get('telefono') },
        }),
      })
      setUsuario(pedido.usuario)
      vaciar()
      navigate(`/pedido/confirmado/${pedido.id}`, { replace: true })
    } catch (err) { setError(err.message); setEnviando(false) }
  }

  const descuento = cupon && data ? Math.round(data.subtotal * cupon.pct) / 100 : 0

  return (
    <main id="contenido" className="pagina">
      <h1>Tramitar pedido</h1>
      <form onSubmit={enviar} className="checkout">
        <div className="checkout__pasos">
          {usuario === null && (
            <section className="panel form">
              <h2 className="seccion-titulo">Tus datos</h2>
              <p>¿Ya eres cliente? <Link to="/entrar?volver=/pedido">Entra</Link> y no tendrás que rellenarlos. Si no, creamos tu cuenta con este pedido.</p>
              <Campo id="nombre" label="Nombre y apellidos" autoComplete="name" required />
              <Campo id="email" label="Email" type="email" autoComplete="email" required />
              <Campo id="password" label="Contraseña para tu cuenta" type="password" autoComplete="new-password" minLength={10} required
                ayuda="Al menos 10 caracteres, con letras y números. Con ella podrás seguir tus pedidos." />
              <Campo id="telefono" label="Teléfono para el transportista" type="tel" autoComplete="tel" />
            </section>
          )}
          <section className="panel form">
            <h2 className="seccion-titulo">Entrega</h2>
            <Campo id="direccion" label="Dirección completa" autoComplete="street-address" placeholder="Calle, número, piso · código postal y población" required />
          </section>
          <section className="panel form">
            <h2 className="seccion-titulo">Pago con tarjeta</h2>
            <Campo id="tarjeta" label="Número de tarjeta" inputMode="numeric" autoComplete="cc-number" required />
            <div className="form__fila">
              <Campo id="caducidad" label="Caducidad (MM/AA)" autoComplete="cc-exp" placeholder="MM/AA" required />
              <Campo id="cvc" label="CVC" inputMode="numeric" autoComplete="cc-csc" maxLength={4} required />
            </div>
          </section>
        </div>

        <aside className="totales panel">
          <h2 className="seccion-titulo">Resumen</h2>
          {data && (
            <>
              <ul className="totales__lineas">
                {data.lineas.map((l) => <li key={l.id}><span>{l.cantidad} × {l.nombre}</span><span>{euros(l.precio * l.cantidad)}</span></li>)}
              </ul>
              <div className="cupon">
                <label htmlFor="cupon">Cupón</label>
                <input id="cupon" autoComplete="off" />
                <button type="button" className="enlace-boton" onClick={probarCupon}>Aplicar</button>
              </div>
              <dl>
                <dt>Subtotal</dt><dd>{euros(data.subtotal)}</dd>
                {cupon && <><dt>Cupón {cupon.codigo}</dt><dd>−{euros(descuento)}</dd></>}
                <dt>Envío</dt><dd>{data.envio ? euros(data.envio) : 'Gratis'}</dd>
                <dt className="totales__total">Total</dt><dd className="totales__total">{euros(data.subtotal - descuento + data.envio)}</dd>
              </dl>
            </>
          )}
          <Aviso>{error}</Aviso>
          <button type="submit" className="tirador tirador--ancho tirador--grande" disabled={enviando || !data}>
            {enviando ? 'Procesando…' : 'Pagar y hacer el pedido'}
          </button>
        </aside>
      </form>
    </main>
  )
}

export function Confirmado() {
  const { id } = useParams()
  return (
    <main id="contenido" className="pagina pagina--estrecha">
      <div className="panel confirmado">
        <h1>Pedido {id} recibido</h1>
        <p>Te avisamos cuando salga del almacén. Puedes seguirlo desde tu cuenta.</p>
        <Link to={`/cuenta/pedidos/${id}`} className="tirador tirador--enlace">Ver el pedido</Link>
      </div>
    </main>
  )
}
