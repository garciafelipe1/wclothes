import Link from "next/link"
import { CatalogContent } from "@/components/catalog"
import type { CatalogProduct } from "@/components/catalog"
import { productService } from "@/services/product.service"
import { getLocalizedPath } from "@/i18n/routing"

function mapMedusaProduct(raw: Record<string, unknown>): CatalogProduct {
  const images = Array.isArray(raw.images) ? raw.images as Array<{ url?: string }> : []
  const thumbnail =
    (typeof raw.thumbnail === "string" && raw.thumbnail) || images[0]?.url || null
  const thumbnailHover = images.length > 1 && images[1]?.url ? images[1].url : null

  return {
    id: String(raw.id),
    title: typeof raw.title === "string" ? raw.title : null,
    handle: typeof raw.handle === "string" ? raw.handle : null,
    thumbnail,
    thumbnailHover: thumbnailHover || undefined,
    variants: Array.isArray(raw.variants)
      ? (raw.variants as Array<{
          calculated_price?: { calculated_amount?: number; currency_code?: string }
        }>)
      : undefined,
  }
}

type CatalogPageProps = {
  params: Promise<{ locale: string; countryCode: string }>
  searchParams: Promise<{ page?: string; q?: string; order?: string; category?: string }>
}

export default async function CatalogPage({ params, searchParams }: CatalogPageProps) {
  const { locale, countryCode } = await params
  const homePath = getLocalizedPath(locale, countryCode, "/")
  const catalogPath = getLocalizedPath(locale, countryCode, "/catalog")
  

  let products: CatalogProduct[] = []
  let error: string | null = null
  let totalPages = 1
  let totalItems = 0

  const search = await searchParams
  const page = search.page ? parseInt(search.page, 10) : 1
  const order = search.order as "price_asc" | "price_desc" | "created_at_asc" | "created_at_desc" | undefined
  const validOrder = ["price_asc", "price_desc", "created_at_asc", "created_at_desc"].includes(order ?? "")
    ? order
    : undefined

  try {
    const { products: list, info } = await productService.getAll({
      page: Number.isFinite(page) && page >= 1 ? page : 1,
      q: search.q?.trim() || undefined,
      order: validOrder,
      category: search.category?.trim() || undefined,
    })
    products = list.map((p) => mapMedusaProduct(p as unknown as Record<string, unknown>))
    totalPages = info.totalPages
    totalItems = info.totalItems
  } catch (e) {
    error = e instanceof Error ? e.message : "Error al cargar productos"
  }

  const backendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9001"

  return (
    <div className="catalog-page">
      <div className="catalog-container">
        <nav className="catalog-breadcrumb" aria-label="Breadcrumb">
          <Link href={homePath}>Inicio</Link>
          <span className="catalog-breadcrumb-sep" aria-hidden>›</span>
          <span>Catálogo</span>
        </nav>

        <header className="catalog-header">
          <h1 className="catalog-title">Catálogo</h1>
          <p className="catalog-desc">
            Colección seleccionada. Envío gratis en pedidos superiores a $50.000.
          </p>
        </header>

        {error && (
          <p className="catalog-error">
            No se pudieron cargar los productos. Asegurá que el backend esté en marcha (
            <code>{backendUrl}</code>).
          </p>
        )}

        {products.length > 0 ? (
          <CatalogContent
            products={products}
            totalItems={totalItems}
            totalPages={totalPages}
          />
        ) : (
          <section className="catalog-empty" aria-label="Sin resultados">
            <p className="catalog-empty-title">
              {error ? "Error de conexión" : "No hay productos en este momento"}
            </p>
            <p className="catalog-empty-desc">
              {error
                ? "Iniciá el backend de Medusa y recargá la página para ver los productos."
                : "Agregá productos desde el panel de administración de Medusa."}
            </p>
            <Link href={homePath} className="catalog-empty-link">
              Volver al inicio
            </Link>
          </section>
        )}
      </div>
    </div>
  )
}
