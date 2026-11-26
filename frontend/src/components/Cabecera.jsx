import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Lupa, Persona, Carrito } from './Iconos.jsx'
import { useCarrito } from '../carrito.jsx'
import { useSesion } from '../sesion.jsx'

export default function Cabecera() {
  const { unidades } = useCarrito()
  const { usuario } = useSesion()
  const [params] = useSearchParams()
  const [q, setQ] = useState(params.get('q') || '')
  const navigate = useNavigate()

  const buscar = (e) => {
    e.preventDefault()
    navigate(`/buscar?q=${encodeURIComponent(q.trim())}`)
  }

  return (
    <header className="cabecera">
      <div className="cabecera__aviso">
        <span>Envío gratis en pedidos desde 49 €</span>
        <span>Recogida en tienda en 2 horas</span>
        <span>Atención al profesional: 910 000 118</span>
      </div>
      <div className="cabecera__barra">
        <Link to="/" className="logo" aria-label="Tornillo Mayor, ir a la portada">
          <span className="logo__nombre">Tornillo<b>Mayor</b></span>
          <span className="logo__lema">Ferretería desde 1987</span>
        </Link>

        <form className="buscador" role="search" onSubmit={buscar}>
          <label htmlFor="q" className="visually-hidden">Buscar en la tienda</label>
          <input
            id="q" name="q" type="search" value={q} onChange={(e) => setQ(e.target.value)}
            placeholder="Taladro, tacos del 8, silicona, cable 2,5…" autoComplete="off"
          />
          <button type="submit"><Lupa /><span>Buscar</span></button>
        </form>

        <nav className="cabecera__cuenta" aria-label="Tu cuenta">
          {usuario?.rol === 'admin' && <Link to="/admin" className="cabecera__admin"><span>Admin</span></Link>}
          <Link to={usuario ? '/cuenta' : '/entrar'}><Persona /><span>{usuario ? usuario.nombre.split(' ')[0] : 'Entrar'}</span></Link>
          <Link to="/carrito" className="cabecera__carrito">
            <Carrito /><span>Carrito</span>
            <span className="contador" aria-label={`${unidades} artículos`}>{unidades}</span>
          </Link>
        </nav>
      </div>
    </header>
  )
}
