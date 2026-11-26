import { Routes, Route, Link } from 'react-router-dom'
import Cabecera from './components/Cabecera.jsx'
import Pie from './components/Pie.jsx'
import Home from './pages/Home.jsx'
import Listado from './pages/Listado.jsx'
import Producto from './pages/Producto.jsx'
import Entrar from './pages/Entrar.jsx'
import Registro from './pages/Registro.jsx'
import { Recuperar, Restablecer } from './pages/Recuperar.jsx'
import { Cuenta, DetallePedido, Protegida } from './pages/Cuenta.jsx'
import Carrito from './pages/Carrito.jsx'
import Checkout, { Confirmado } from './pages/Checkout.jsx'
import Admin from './pages/Admin.jsx'
import Profesionales from './pages/Profesionales.jsx'
import { Contacto, Devoluciones, Envios, Legal, Tienda } from './pages/Info.jsx'

function Pendiente() {
  return (
    <main id="contenido" className="pagina">
      <h1>Esta página no existe</h1>
      <p className="vacio">Puede que el enlace esté mal escrito o que la página se haya movido. <Link to="/">Volver a la portada</Link></p>
    </main>
  )
}

export default function App() {
  return (
    <>
      <a href="#contenido" className="saltar">Saltar al contenido</a>
      <Cabecera />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/buscar" element={<Listado />} />
        <Route path="/categoria/:slug" element={<Listado />} />
        <Route path="/producto/:id" element={<Producto />} />
        <Route path="/entrar" element={<Entrar />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/recuperar" element={<Recuperar />} />
        <Route path="/restablecer" element={<Restablecer />} />
        <Route path="/carrito" element={<Carrito />} />
        <Route path="/pedido" element={<Checkout />} />
        <Route path="/pedido/confirmado/:id" element={<Protegida><Confirmado /></Protegida>} />
        <Route path="/cuenta" element={<Protegida><Cuenta /></Protegida>} />
        <Route path="/cuenta/pedidos" element={<Protegida><Cuenta /></Protegida>} />
        <Route path="/cuenta/pedidos/:id" element={<Protegida><DetallePedido /></Protegida>} />
        <Route path="/admin" element={<Protegida rol="admin"><Admin /></Protegida>} />
        <Route path="/admin/pedidos/:id" element={<Protegida rol="admin"><DetallePedido admin /></Protegida>} />
        <Route path="/profesionales" element={<Profesionales />} />
        <Route path="/ayuda/envios" element={<Envios />} />
        <Route path="/ayuda/devoluciones" element={<Devoluciones />} />
        <Route path="/tienda" element={<Tienda />} />
        <Route path="/contacto" element={<Contacto />} />
        <Route path="/legal/aviso" element={<Legal pagina="aviso" />} />
        <Route path="/legal/privacidad" element={<Legal pagina="privacidad" />} />
        <Route path="/legal/cookies" element={<Legal pagina="cookies" />} />
        <Route path="*" element={<Pendiente />} />
      </Routes>
      <Pie />
    </>
  )
}
