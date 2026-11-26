import { Link } from 'react-router-dom'

export default function Pie() {
  return (
    <footer className="pie">
      <div className="pie__cols">
        <div>
          <p className="pie__marca">Tornillo<b>Mayor</b></p>
          <p>C/ de la Fragua, 14 · 28000 Madrid</p>
          <p>Lunes a viernes de 8:30 a 20:00 · sábados de 9:00 a 14:00</p>
        </div>
        <nav aria-label="Ayuda">
          <h2>Tu pedido</h2>
          <Link to="/ayuda/envios">Envíos y plazos</Link>
          <Link to="/ayuda/devoluciones">Devoluciones</Link>
          <Link to="/cuenta/pedidos">Mis pedidos</Link>
        </nav>
        <nav aria-label="Empresa">
          <h2>La tienda</h2>
          <Link to="/profesionales">Cuenta profesional</Link>
          <Link to="/tienda">Quiénes somos</Link>
          <Link to="/contacto">Contacto</Link>
        </nav>
        <nav aria-label="Legal">
          <h2>Legal</h2>
          <Link to="/legal/aviso">Aviso legal</Link>
          <Link to="/legal/privacidad">Privacidad</Link>
          <Link to="/legal/cookies">Cookies</Link>
        </nav>
      </div>
      <p className="pie__copy">© {new Date().getFullYear()} Tornillo Mayor, S.L. Precios con IVA incluido.</p>
    </footer>
  )
}
