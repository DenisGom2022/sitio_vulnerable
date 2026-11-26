import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { api } from '../api.js'
import { Aviso, Campo, Ficha, useEnvio } from '../components/Formulario.jsx'
import { useSesion } from '../sesion.jsx'

export default function Registro() {
  const { setUsuario } = useSesion()
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const volver = params.get('volver')?.startsWith('/') ? params.get('volver') : '/cuenta'

  const enviar = useEnvio(async (f) => {
    const d = await api('/auth/registro', { method: 'POST', body: JSON.stringify(Object.fromEntries(f)) })
    setUsuario(d.usuario)
    navigate(volver)
  }, setError)

  return (
    <main id="contenido" className="pagina pagina--estrecha">
      <Ficha titulo="Crear cuenta">
        <form onSubmit={enviar} className="form">
          <Aviso>{error}</Aviso>
          <Campo id="nombre" label="Nombre y apellidos" autoComplete="name" required />
          <Campo id="email" label="Email" type="email" autoComplete="email" required />
          <Campo id="password" label="Contraseña" type="password" autoComplete="new-password" minLength={10} required
            ayuda="Al menos 10 caracteres, con letras y números." />
          <Campo id="telefono" label="Teléfono (opcional)" type="tel" autoComplete="tel" />
          <button type="submit" className="tirador tirador--ancho">Crear cuenta</button>
        </form>
      </Ficha>
      <p className="pagina__alterna">¿Ya tienes cuenta? <Link to="/entrar">Entra</Link></p>
    </main>
  )
}
