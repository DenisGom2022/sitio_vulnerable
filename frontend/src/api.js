import { useEffect, useState } from 'react'

export async function api(path, options = {}) {
  const res = await fetch(`/api${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  })
  const data = await res.json().catch(() => null)
  if (!res.ok) throw Object.assign(new Error(data?.error || `Error ${res.status}`), { status: res.status, data })
  return data
}

// Carga un recurso GET y devuelve { data, error, loading }.
export function useApi(path) {
  const [state, setState] = useState({ data: null, error: null, loading: true })
  useEffect(() => {
    let vivo = true
    setState((s) => ({ ...s, loading: true, error: null }))
    api(path)
      .then((data) => vivo && setState({ data, error: null, loading: false }))
      .catch((error) => vivo && setState({ data: null, error, loading: false }))
    return () => { vivo = false }
  }, [path])
  return state
}
