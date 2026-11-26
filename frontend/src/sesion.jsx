import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { api } from './api.js'

const SesionCtx = createContext(null)

export function SesionProvider({ children }) {
  const [usuario, setUsuario] = useState(undefined) // undefined = comprobando

  const refrescar = useCallback(() =>
    api('/auth/me').then((d) => setUsuario(d.usuario)).catch(() => setUsuario(null)), [])

  useEffect(() => { refrescar() }, [refrescar])

  const entrar = async (email, password) => {
    const d = await api('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) })
    setUsuario(d.usuario)
    return d.usuario
  }
  const salir = async () => {
    await api('/auth/logout', { method: 'POST', body: '{}' }).catch(() => {})
    setUsuario(null)
  }

  return <SesionCtx.Provider value={{ usuario, setUsuario, entrar, salir, refrescar }}>{children}</SesionCtx.Provider>
}

export const useSesion = () => useContext(SesionCtx)
