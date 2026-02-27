const ITEMS = [
  "ENVÍO GRATIS EN PEDIDOS SELECCIONADOS",
  "NUEVOS INGRESOS",
  "COLECCIONES EXCLUSIVAS",
  "DEVOLUCIONES GRATIS",
]

export default function Marquee() {
  const content = ITEMS.map((t) => `${t}  ★  `).join("")
  const doubled = content + content

  return (
    <div className="home-marquee" aria-hidden>
      <div className="home-marquee__track">
        <span className="home-marquee__text">{doubled}</span>
      </div>
    </div>
  )
}
