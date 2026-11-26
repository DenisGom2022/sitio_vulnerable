export const comoDataUrl = (file) => new Promise((ok, mal) => {
  const r = new FileReader()
  r.onload = () => ok(r.result)
  r.onerror = () => mal(new Error('No se ha podido leer el archivo'))
  r.readAsDataURL(file)
})

export const comoTexto = (file) => new Promise((ok, mal) => {
  const r = new FileReader()
  r.onload = () => ok(r.result)
  r.onerror = () => mal(new Error('No se ha podido leer el archivo'))
  r.readAsText(file)
})
