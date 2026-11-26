import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Aviso, Campo, Ficha, useEnvio } from '../components/Formulario.jsx'
import { useSesion } from '../sesion.jsx'

export default function Entrar() {
  const { entrar } = useSesion()
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const volver = params.get('volver')?.startsWith('/') ? params.get('volver') : '/cuenta'

  const enviar = useEnvio(async (f) => {
    await entrar(f.get('email'), f.get('password'))
    navigate(volver)
  }, setError)

  return (
    <main id="contenido" className="pagina pagina--estrecha">
      <Ficha titulo="Entrar en tu cuenta">
        <form onSubmit={enviar} className="form">
          <Aviso>{error}</Aviso>
          <Campo id="email" label="Email" type="email" autoComplete="email" required />
          <Campo id="password" label="Contraseña" type="password" autoComplete="current-password" required />
          <button type="submit" className="tirador tirador--ancho">Entrar</button>
          <p className="form__pie"><Link to="/recuperar">He olvidado mi contraseña</Link></p>
        </form>
      </Ficha>
      <p className="pagina__alterna">¿Primera vez en Tornillo Mayor? <Link to={`/registro?volver=${encodeURIComponent(volver)}`}>Crea tu cuenta</Link></p>
    </main>
  )
}
