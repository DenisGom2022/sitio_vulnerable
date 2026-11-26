// Dibujos de catálogo a trazo, como los de los catálogos de ferretería en papel.
// Trazo tinta, aguada suave dentro de la línea.

const T = { fill: 'none', stroke: 'var(--tinta)', strokeWidth: 3, strokeLinecap: 'round', strokeLinejoin: 'round' }
const aguada = (c) => ({ fill: c, stroke: 'var(--tinta)', strokeWidth: 3, strokeLinejoin: 'round' })

const VERDE = 'rgba(46,75,63,.18)'
const AMARILLO = 'rgba(244,197,49,.55)'
const METAL = 'rgba(28,42,36,.08)'
const ROJO = 'rgba(196,58,44,.35)'

const dibujos = {
  caja: (
    <>
      {/* caja de cartón con etiqueta, para artículos sin dibujo propio */}
      <path d="M40 46l40-16 40 16v50l-40 16-40-16z" style={aguada('rgba(185,141,95,.35)')} />
      <path d="M40 46l40 16 40-16M80 62v50" {...T} />
      <path d="M58 38l40 16" {...T} strokeWidth={2} />
      <path d="M88 76l22-9v14l-22 9z" style={aguada('#fff')} />
    </>
  ),
  taladro: (
    <>
      <path d="M44 34h66a14 14 0 0 1 14 14v6a6 6 0 0 1-6 6H84l-8 34H52l6-34H44a8 8 0 0 1-8-8V42a8 8 0 0 1 8-8z" style={aguada(AMARILLO)} />
      <rect x="44" y="92" width="44" height="18" rx="4" style={aguada(VERDE)} />
      <path d="M124 44h10M134 40v10M134 45h18" {...T} />
      <path d="M56 46h40M64 60l-4 22" {...T} strokeWidth={2} />
      <path d="M78 64v8" {...T} />
    </>
  ),
  tacos: (
    <>
      {/* taco de nylon: valona, cuerpo con aletas y punta abierta; tornillo encima */}
      <path d="M30 70h8v-16h-8z" style={aguada(METAL)} />
      <path d="M38 58h70l14 4v10l-14 4H38z" style={aguada('rgba(232,226,205,.9)')} />
      <path d="M48 58l6-6M62 58l6-6M76 58l6-6M90 58l6-6M48 76l6 6M62 76l6 6M76 76l6 6M90 76l6 6" {...T} strokeWidth={2.5} />
      <path d="M108 67h14" {...T} strokeWidth={2} />
      <path d="M36 30h8v12h-8z" style={aguada(METAL)} />
      <path d="M44 33h64l12 3-12 3H44z" style={aguada(METAL)} />
      <path d="M54 33l3 6M66 33l3 6M78 33l3 6M90 33l3 6M102 33l3 6" {...T} strokeWidth={1.8} />
    </>
  ),
  silicona: (
    <>
      <path d="M38 50h70v28H38z" style={aguada('#fff')} />
      <path d="M108 54l30-2v24l-30-2" style={aguada(METAL)} />
      <path d="M138 58l14-4M138 70l14 4" {...T} />
      <rect x="26" y="46" width="12" height="36" rx="3" style={aguada(VERDE)} />
      <path d="M50 58h40M50 68h28" {...T} strokeWidth={2} />
    </>
  ),
  martillo: (
    <>
      <path d="M40 30h46l6 6v14l-6 6H64v-4H40z" style={aguada(METAL)} />
      <path d="M92 36c12-4 22 0 28 8" {...T} />
      <path d="M58 56h14l4 58H54z" style={aguada(AMARILLO)} />
      <path d="M60 82h12M59 92h14" {...T} strokeWidth={2} />
    </>
  ),
  grifo: (
    <>
      <rect x="54" y="88" width="40" height="14" rx="3" style={aguada(METAL)} />
      <path d="M64 88V40a26 26 0 0 1 52 0v10" style={{ ...T, strokeWidth: 9 }} />
      <path d="M64 88V40a26 26 0 0 1 52 0v10" style={{ ...T, stroke: '#fff', strokeWidth: 3 }} />
      <path d="M110 50h12" {...T} />
      <path d="M76 70l-24-14" style={{ ...T, strokeWidth: 6 }} />
      <circle cx="74" cy="70" r="7" style={aguada(VERDE)} />
    </>
  ),
  cable: (
    <>
      <circle cx="74" cy="64" r="40" style={aguada(AMARILLO)} />
      <circle cx="74" cy="64" r="28" {...T} strokeWidth={2} />
      <circle cx="74" cy="64" r="14" style={aguada('#fff')} />
      <path d="M110 80c14 6 24 12 34 26" {...T} />
      <path d="M144 106l4 4M140 108l2 4" {...T} stroke="#B5651D" />
    </>
  ),
  tijera: (
    <>
      <path d="M78 58L36 26c-6-4-12 2-8 8l40 32" style={aguada(METAL)} />
      <path d="M78 58l-30 4c-6 1-6 8 0 9l34-4" style={aguada(METAL)} />
      <path d="M84 62l48 30c6 4 12-2 8-8L96 56" style={aguada(ROJO)} />
      <path d="M84 66l36 34c5 4 11-1 8-7L94 62" style={aguada(ROJO)} />
      <circle cx="84" cy="62" r="5" style={aguada('#fff')} />
    </>
  ),
  allen: (
    <>
      {/* llaves Allen en L, de mayor a menor */}
      <path d="M44 112V34h26" style={{ ...T, strokeWidth: 11 }} />
      <path d="M44 112V34h26" style={{ ...T, stroke: 'rgba(201,205,200,1)', strokeWidth: 5 }} />
      <path d="M76 112V48h22" style={{ ...T, strokeWidth: 10 }} />
      <path d="M76 112V48h22" style={{ ...T, stroke: 'rgba(201,205,200,1)', strokeWidth: 4 }} />
      <path d="M104 112V62h18" style={{ ...T, strokeWidth: 9 }} />
      <path d="M104 112V62h18" style={{ ...T, stroke: 'rgba(201,205,200,1)', strokeWidth: 3.5 }} />
      <path d="M128 112V74h14" style={{ ...T, strokeWidth: 8 }} />
      <path d="M128 112V74h14" style={{ ...T, stroke: 'rgba(201,205,200,1)', strokeWidth: 3 }} />
    </>
  ),
  rodillo: (
    <>
      <rect x="34" y="28" width="86" height="30" rx="14" style={aguada(VERDE)} />
      <path d="M50 36v14M66 36v14M82 36v14M98 36v14" {...T} strokeWidth={1.5} />
      <path d="M120 43h14v26H80v14" {...T} />
      <rect x="72" y="83" width="16" height="32" rx="4" style={aguada(AMARILLO)} />
    </>
  ),
}

export default function Dibujo({ tipo, className }) {
  return (
    <svg viewBox="0 0 160 124" className={className} aria-hidden="true" focusable="false">
      {dibujos[tipo] || dibujos.caja}
    </svg>
  )
}
