// Piezas de formulario en el lenguaje de la cajonera.
export function Campo({ id, label, ayuda, error, ...props }) {
  return (
    <div className="campo">
      <label htmlFor={id}>{label}</label>
      <input id={id} name={id} aria-invalid={error ? 'true' : undefined}
        aria-describedby={ayuda ? `${id}-ayuda` : undefined} {...props} />
      {ayuda && <p id={`${id}-ayuda`} className="campo__ayuda">{ayuda}</p>}
    </div>
  )
}

export function Aviso({ tipo = 'error', children }) {
  if (!children) return null
  return <p className={`aviso aviso--${tipo}`} role={tipo === 'error' ? 'alert' : 'status'}>{children}</p>
}

export function Ficha({ titulo, children, className = '' }) {
  return (
    <section className={`ficha ${className}`}>
      <div className="portaetiquetas ficha__tarjeta">
        {titulo && <h1 className="ficha__titulo">{titulo}</h1>}
        {children}
      </div>
    </section>
  )
}

// Envuelve un submit async: gestiona "enviando" y el mensaje de error.
export function useEnvio(fn, setError) {
  return async (e) => {
    e.preventDefault()
    setError('')
    const boton = e.currentTarget.querySelector('[type=submit]')
    if (boton) boton.disabled = true
    try { await fn(new FormData(e.currentTarget)) } catch (err) { setError(err.message) } finally { if (boton) boton.disabled = false }
  }
}
