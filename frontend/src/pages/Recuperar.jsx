import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { api } from '../api.js'
import { Aviso, Campo, Ficha, useEnvio } from '../components/Formulario.jsx'

export function Recuperar() {
  const [error, setError] = useState('')
  const [hecho, setHecho] = useState('')
  const enviar = useEnvio(async (f) => {
    const d = await api('/auth/recuperar', { method: 'POST', body: JSON.stringify({ email: f.get('email') }) })
    setHecho(d.mensaje)
  }, setError)

  return (
    <main id="contenido" className="pagina pagina--estrecha">
      <Ficha titulo="Recuperar contraseña">
        {hecho ? <Aviso tipo="ok">{hecho}</Aviso> : (
          <form onSubmit={enviar} className="form">
            <p>Te enviamos un enlace para crear una contraseña nueva.</p>
            <Aviso>{error}</Aviso>
            <Campo id="email" label="Email de tu cuenta" type="email" autoComplete="email" required />
            <button type="submit" className="tirador tirador--ancho">Enviar enlace</button>
          </form>
        )}
      </Ficha>
      <p className="pagina__alterna"><Link to="/entrar">Volver a entrar</Link></p>
    </main>
  )
}

export function Restablecer() {
  const [params] = useSearchParams()
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const enviar = useEnvio(async (f) => {
    if (f.get('password') !== f.get('repite')) throw new Error('Las dos contraseñas no coinciden')
    await api('/auth/restablecer', { method: 'POST', body: JSON.stringify({ token: params.get('token'), password: f.get('password') }) })
    navigate('/entrar')
  }, setError)

  return (
    <main id="contenido" className="pagina pagina--estrecha">
      <Ficha titulo="Contraseña nueva">
        <form onSubmit={enviar} className="form">
          <Aviso>{error}</Aviso>
          <Campo id="password" label="Contraseña nueva" type="password" autoComplete="new-password" minLength={10} required
            ayuda="Al menos 10 caracteres, con letras y números." />
          <Campo id="repite" label="Repítela" type="password" autoComplete="new-password" required />
          <button type="submit" className="tirador tirador--ancho">Guardar contraseña</button>
        </form>
      </Ficha>
    </main>
  )
}
