import { createContext, useContext, useEffect, useState } from 'react'

const CarritoCtx = createContext(null)

export function CarritoProvider({ children }) {
  const [lineas, setLineas] = useState(() => {
    try { return JSON.parse(localStorage.getItem('carrito')) || {} } catch { return {} }
  })

  useEffect(() => { localStorage.setItem('carrito', JSON.stringify(lineas)) }, [lineas])

  const anadir = (id, uds = 1) => setLineas((l) => ({ ...l, [id]: Math.min(999, (l[id] || 0) + uds) }))
  const fijar = (id, uds) => setLineas((l) => {
    const n = { ...l }
    if (uds > 0) n[id] = Math.min(999, uds); else delete n[id]
    return n
  })
  const vaciar = () => setLineas({})
  const unidades = Object.values(lineas).reduce((a, b) => a + b, 0)
  const paraApi = Object.entries(lineas).map(([id, cantidad]) => ({ id: Number(id), cantidad }))

  return <CarritoCtx.Provider value={{ lineas, anadir, fijar, vaciar, unidades, paraApi }}>{children}</CarritoCtx.Provider>
}

export const useCarrito = () => useContext(CarritoCtx)
