import { useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api.js'
import { Aviso, Campo, useEnvio } from '../components/Formulario.jsx'
import { Camion, Documento, Llave } from '../components/Iconos.jsx'
import { useCarrito } from '../carrito.jsx'
import { comoTexto } from '../leerArchivo.js'
import { useSesion } from '../sesion.jsx'

const EJEMPLO = `<presupuesto obra="Baño C/ Olmo 7">
  <linea ref="03-041" cantidad="4"/>
  <linea ref="04-318" cantidad="2"/>
</presupuesto>`

function Alta() {
  const { refrescar } = useSesion()
  const [error, setError] = useState('')
  const enviar = useEnvio(async (f) => {
    await api('/profesionales/alta', { method: 'POST', body: JSON.stringify({ empresa: f.get('empresa'), nif: f.get('nif') }) })
    await refrescar()
  }, setError)
  return (
    <form onSubmit={enviar} className="form panel">
      <h2 className="seccion-titulo">Pasa tu cuenta a profesional</h2>
      <Aviso>{error}</Aviso>
      <Campo id="empresa" label="Empresa o nombre comercial" autoComplete="organization" required />
      <Campo id="nif" label="NIF o CIF" required />
      <button type="submit" className="tirador">Activar cuenta profesional</button>
    </form>
  )
}

function Importar() {
  const { anadir } = useCarrito()
  const [error, setError] = useState('')
  const [resultado, setResultado] = useState(null)
  const [hecho, setHecho] = useState(false)

  const subir = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setError(''); setResultado(null); setHecho(false)
    try {
      const xml = await comoTexto(file)
      setResultado(await api('/profesionales/importar', { method: 'POST', body: JSON.stringify({ xml, nombre: file.name }) }))
    } catch (err) { setError(err.message) }
    e.target.value = ''
  }

  const pasarAlCarrito = () => {
    resultado.lineas.forEach((l) => anadir(l.id, l.cantidad))
    setHecho(true)
  }

  return (
    <section className="panel form" aria-labelledby="imp-t">
      <h2 id="imp-t" className="seccion-titulo">Importar presupuesto</h2>
      <p>Exporta el presupuesto de tu programa de obra en XML y súbelo aquí: lo convertimos en pedido con tu tarifa.</p>
      <label className="subida">
        <span className="tirador tirador--enlace">Elegir archivo XML</span>
        <input type="file" accept=".xml,application/xml,text/xml" onChange={subir} className="visually-hidden" />
      </label>
      <details className="formato">
        <summary>Formato del archivo</summary>
        <pre>{EJEMPLO}</pre>
      </details>
      <Aviso>{error}</Aviso>
      {resultado && (
        <div className="importado">
          <ul className="totales__lineas">
            {resultado.lineas.map((l, i) => (
              <li key={i}><span>{l.cantidad} × {l.nombre} <span className="ref">REF {l.ref}</span></span>
                {l.cantidad > l.stock && <span className="linea__aviso">Stock: {l.stock}</span>}</li>
            ))}
          </ul>
          {resultado.descartadas.length > 0 && <Aviso>No reconocemos estas referencias: {resultado.descartadas.join(', ')}</Aviso>}
          {hecho ? <Aviso tipo="ok">Añadido. <Link to="/carrito">Ir al carrito</Link></Aviso>
            : resultado.lineas.length > 0 && <button type="button" className="tirador" onClick={pasarAlCarrito}>Añadir {resultado.lineas.length} líneas al carrito</button>}
        </div>
      )}
    </section>
  )
}

export default function Profesionales() {
  const { usuario } = useSesion()
  return (
    <main id="contenido" className="pagina">
      <h1>Cuenta profesional</h1>
      <div className="dos-columnas">
        <div className="texto">
          <p className="entradilla">Fontaneros, electricistas, carpinteros y empresas de reformas: compra con tu tarifa de oficio y pasa tus presupuestos a pedido sin teclear.</p>
          <ul className="pro__ventajas pro__ventajas--claro">
            <li><Llave /><span><b>Tarifa de oficio</b>Un 8 % menos en todo el catálogo, aplicado en el carrito.</span></li>
            <li><Documento /><span><b>Presupuestos en XML</b>Sube el archivo y llenamos el carrito por referencia.</span></li>
            <li><Camion /><span><b>Entrega en obra</b>A primera hora, con albarán valorado.</span></li>
          </ul>
        </div>
        <div>
          {usuario === null && (
            <div className="panel form">
              <p>Para darte de alta necesitas una cuenta de cliente.</p>
              <Link to="/registro?volver=/profesionales" className="tirador tirador--enlace">Crear cuenta</Link>
              <p><Link to="/entrar?volver=/profesionales">Ya tengo cuenta</Link></p>
            </div>
          )}
          {usuario?.rol === 'customer' && <Alta />}
          {usuario?.rol === 'pro' && <Importar />}
          {usuario?.rol === 'admin' && <p className="panel">Las cuentas de administración no compran con tarifa profesional.</p>}
        </div>
      </div>
    </main>
  )
}
