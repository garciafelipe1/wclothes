import {
  StickyStackSection,
  Marquee,
  CategoryGrid,
  FeaturedProducts,
  BrandStatement,
} from "@/components/home"
import { getLocalizedPath } from "@/i18n/routing"
import { productService } from "@/services/product.service"

const STACK_SECTIONS = [
  {
    image: "https://www.nocta.com/cdn/shop/files/finaldesktopsp26_1.jpg?v=1771389982&width=3840",
    title: "Spring '24 Collection",
    description: "La última colección con prendas exclusivas y tonos en gradiente. Envío gratis en pedidos seleccionados.",
    ctaText: "VER COLECCIÓN",
    ctaPath: "/catalog",
  },
  {
    image: "https://www.nocta.com/cdn/shop/files/codesktop.jpg?v=1765873194&width=3840",
    title: "Urban Essentials",
    description: "Prendas pensadas para la ciudad. Diseño limpio y materiales que aguantan el día a día.",
    ctaText: "VER URBAN",
    ctaPath: "/catalog",
  },
  {
    image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1920&q=80",
    title: "Nueva temporada",
    description: "Colores y texturas para esta temporada. Envío gratis en pedidos superiores a $150.",
    ctaText: "COMPRAR AHORA",
    ctaPath: "/catalog",
  },
  {
    image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1920&q=80",
    title: "Accesorios",
    description: "Completa tu look. Gorros, mochilas y más.",
    ctaText: "VER ACCESORIOS",
    ctaPath: "/catalog",
  },
]

const CATEGORIES = [
  {
    title: "ROPA",
    image: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800&q=80",
    href: "/catalog?category=Ropa",
  },
  {
    title: "ACCESORIOS",
    image: "https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=800&q=80",
    href: "/catalog?category=Accesorios",
  },
  {
    title: "NEW IN",
    image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80",
    href: "/catalog?new=1",
  },
]

function formatPrice(amount?: number, currency?: string): string | undefined {
  if (amount == null) return undefined
  const code = (currency || "ars").toUpperCase()
  return new Intl.NumberFormat("es-AR", { style: "currency", currency: code, minimumFractionDigits: 0 }).format(amount)
}

type HomePageProps = { params: Promise<{ locale: string; countryCode: string }> }

export default async function HomePage({ params }: HomePageProps) {
  const { locale, countryCode } = await params
  const catalogPath = getLocalizedPath(locale, countryCode, "/catalog")

  let featuredProducts: { id: string; title: string | null; handle: string | null; thumbnail: string | null; price?: string }[] = []
  try {
    const { products } = await productService.getAll({ page: 1 })
    featuredProducts = products.slice(0, 4).map((p: any) => {
      const images = Array.isArray(p.images) ? p.images : []
      const thumb = (typeof p.thumbnail === "string" && p.thumbnail) || images[0]?.url || null
      const variant = Array.isArray(p.variants) ? p.variants[0] : undefined
      const price = formatPrice(variant?.calculated_price?.calculated_amount, variant?.calculated_price?.currency_code)
      return {
        id: String(p.id),
        title: typeof p.title === "string" ? p.title : null,
        handle: typeof p.handle === "string" ? p.handle : null,
        thumbnail: thumb,
        price,
      }
    })
  } catch {
    /* products unavailable */
  }

  const localizedCategories = CATEGORIES.map((c) => ({
    ...c,
    href: getLocalizedPath(locale, countryCode, c.href),
  }))

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
            ctaHref={getLocalizedPath(locale, countryCode, section.ctaPath)}
            zIndex={i + 1}
          />
        ))}
      </div>

      <Marquee />

      <CategoryGrid categories={localizedCategories} />

      <FeaturedProducts products={featuredProducts} catalogPath={catalogPath} />

      <BrandStatement />
    </>
  )
}
