import { useState } from 'react'
import { api } from '../api.js'
import { Aviso, Campo, useEnvio } from '../components/Formulario.jsx'

function Texto({ titulo, children }) {
  return <main id="contenido" className="pagina"><h1>{titulo}</h1><div className="texto">{children}</div></main>
}

export const Envios = () => (
  <Texto titulo="Envíos y plazos">
    <p>Preparamos los pedidos de lunes a viernes. Lo que entra antes de las 13:00 sale el mismo día.</p>
    <h2>Plazos</h2>
    <ul><li>Península: 24/48 horas laborables.</li><li>Baleares: 3 a 5 días laborables.</li><li>Recogida en tienda: en 2 horas, en C/ de la Fragua, 14.</li></ul>
    <h2>Precio</h2>
    <p>4,95 € por pedido. Gratis a partir de 49 €. El material voluminoso (sacos, rollos de tubo, perfilería) puede llevar un suplemento que verás antes de pagar.</p>
  </Texto>
)

export const Devoluciones = () => (
  <Texto titulo="Devoluciones">
    <p>Tienes 30 días desde que recibes el pedido para devolver cualquier artículo sin usar y en su embalaje original.</p>
    <h2>Cómo hacerlo</h2>
    <ol><li>Escríbenos desde Contacto con el número de pedido.</li><li>Te enviamos la etiqueta de recogida o lo traes a la tienda.</li><li>Devolvemos el importe en la misma tarjeta en un máximo de 14 días.</li></ol>
    <p>El material cortado a medida (cable, cadena, tubo por metros) no se puede devolver salvo defecto.</p>
  </Texto>
)

export const Tienda = () => (
  <Texto titulo="Quiénes somos">
    <p className="entradilla">Tornillo Mayor abrió en 1987 como una ferretería de barrio de cuarenta metros cuadrados. Seguimos siendo una empresa familiar.</p>
    <p>Hoy servimos a particulares y a profesionales desde la misma tienda de siempre y desde esta web, con más de diecisiete mil referencias en almacén. Detrás del mostrador sigue habiendo gente que sabe qué taco pide tu pared.</p>
    <h2>Dónde estamos</h2>
    <p>C/ de la Fragua, 14 · 28000 Madrid<br />Lunes a viernes de 8:30 a 20:00 · sábados de 9:00 a 14:00</p>
  </Texto>
)

export function Contacto() {
  const [error, setError] = useState('')
  const [hecho, setHecho] = useState('')
  const enviar = useEnvio(async (f) => {
    const d = await api('/contacto', { method: 'POST', body: JSON.stringify(Object.fromEntries(f)) })
    setHecho(d.mensaje)
  }, setError)
  return (
    <main id="contenido" className="pagina">
      <h1>Contacto</h1>
      <div className="dos-columnas">
        <div className="texto">
          <p className="entradilla">Llámanos al 910 000 118 o escríbenos. Contesta alguien de la tienda.</p>
          <p>Horario: lunes a viernes de 8:30 a 20:00 y sábados de 9:00 a 14:00.</p>
          <p>Profesionales: 910 000 118, opción 2.</p>
        </div>
        {hecho ? <Aviso tipo="ok">{hecho}</Aviso> : (
          <form onSubmit={enviar} className="form panel">
            <Aviso>{error}</Aviso>
            <Campo id="nombre" label="Nombre" autoComplete="name" required />
            <Campo id="email" label="Email" type="email" autoComplete="email" required />
            <div className="campo"><label htmlFor="mensaje">Mensaje</label><textarea id="mensaje" name="mensaje" rows={6} maxLength={3000} required /></div>
            <button type="submit" className="tirador">Enviar mensaje</button>
          </form>
        )}
      </div>
    </main>
  )
}

const LEGAL = {
  aviso: ['Aviso legal', [
    'Titular: Tornillo Mayor, S.L. · C/ de la Fragua, 14 · 28000 Madrid.',
    'El uso de esta web implica la aceptación de estas condiciones. Los precios incluyen IVA y pueden cambiar sin previo aviso; se respeta siempre el precio del momento de la compra.',
  ]],
  privacidad: ['Privacidad', [
    'Usamos tus datos solo para gestionar tus pedidos, tu cuenta y, si lo pides, para contestarte.',
    'No los cedemos a terceros salvo al transportista que entrega tu pedido. Puedes pedir acceso, rectificación o borrado escribiendo desde Contacto.',
    'Los datos de tu tarjeta los procesa la pasarela de pago; nosotros solo guardamos sus cuatro últimas cifras.',
  ]],
  cookies: ['Cookies', [
    'Usamos una única cookie técnica para mantener tu sesión iniciada. El carrito se guarda en tu propio navegador.',
    'No usamos cookies publicitarias.',
  ]],
}

export function Legal({ pagina }) {
  const [titulo, parrafos] = LEGAL[pagina]
  return <Texto titulo={titulo}>{parrafos.map((p, i) => <p key={i}>{p}</p>)}</Texto>
}
