import { StickyStackSection } from "@/components/home"

const STACK_SECTIONS = [
  {
    image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1920&q=80",
    title: "Spring '24 Collection",
    description: "La última colección con prendas exclusivas y tonos en gradiente. Envío gratis en pedidos seleccionados.",
    ctaText: "VER COLECCIÓN",
    ctaHref: "/catalog",
  },
  {
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1920&q=80",
    title: "Urban Essentials",
    description: "Prendas pensadas para la ciudad. Diseño limpio y materiales que aguantan el día a día.",
    ctaText: "VER URBAN",
    ctaHref: "/catalog",
  },
  {
    image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1920&q=80",
    title: "Nueva temporada",
    description: "Colores y texturas para esta temporada. Envío gratis en pedidos superiores a $150.",
    ctaText: "COMPRAR AHORA",
    ctaHref: "/catalog",
  },
  {
    image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1920&q=80",
    title: "Accesorios",
    description: "Completa tu look. Gorros, mochilas y más.",
    ctaText: "VER ACCESORIOS",
    ctaHref: "/catalog",
  },
]

export default function HomePage() {
  return (
    <>
      <div className="sticky-stack">
        {STACK_SECTIONS.map((section, i) => (
          <StickyStackSection
            key={i}
            image={section.image}
            title={section.title}
            description={section.description}
            ctaText={section.ctaText}
            ctaHref={section.ctaHref}
            zIndex={i + 1}
          />
        ))}
      </div>
      <section className="section-content">
        <h2 style={{ marginTop: 0, fontSize: "1.75rem" }}>Novedades</h2>
        <p style={{ color: "var(--color-text-muted)", marginBottom: "2rem" }}>
          Explora la tienda y descubre las últimas prendas.
        </p>
        <a
          href="/catalog"
          style={{
            display: "inline-block",
            padding: "0.75rem 1.5rem",
            background: "var(--color-bar)",
            color: "var(--color-bar-text)",
            fontWeight: 600,
            letterSpacing: "0.05em",
          }}
        >
          VER PRODUCTOS
        </a>
      </section>
    </>
  )
}
