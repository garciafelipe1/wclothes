import Link from "next/link"
import { medusa } from "@/lib/medusa"
import { CatalogContent } from "@/components/catalog"
import type { CatalogProduct } from "@/components/catalog"
import { DEMO_PRODUCTS } from "@/data/demo-products"

export default async function CatalogPage() {
  let products: CatalogProduct[] = []
  let error: string | null = null

  try {
    const { products: list } = await medusa.store.product.list({
      limit: 50,
      fields: "id,title,handle,thumbnail,variants.calculated_price",
    })
    const fromApi = (list ?? []).map((p) => {
      const raw = p as unknown as Record<string, unknown>
      return {
        id: String(raw.id),
        title: typeof raw.title === "string" ? raw.title : null,
        handle: typeof raw.handle === "string" ? raw.handle : null,
        thumbnail: typeof raw.thumbnail === "string" ? raw.thumbnail : null,
        variants: Array.isArray(raw.variants)
          ? (raw.variants as Array<{ calculated_price?: { calculated_amount?: number; currency_code?: string } }>)
          : undefined,
      } satisfies CatalogProduct
    })
    products = fromApi.length > 0 ? fromApi : DEMO_PRODUCTS
  } catch (e) {
    error = e instanceof Error ? e.message : "Error al cargar productos"
    products = DEMO_PRODUCTS
  }

  const backendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9001"

  return (
    <div className="catalog-page">
      <div className="catalog-container">
        <nav className="catalog-breadcrumb" aria-label="Breadcrumb">
          <Link href="/">Inicio</Link>
          <span className="catalog-breadcrumb-sep" aria-hidden>›</span>
          <span>Catálogo</span>
        </nav>

        <header className="catalog-header">
          <h1 className="catalog-title">Catálogo</h1>
          <p className="catalog-desc">
            Productos seleccionados. Envío gratis en pedidos seleccionados.
          </p>
        </header>

        {error && (
          <p className="catalog-error">
            {error}. Asegúrate de que el backend esté en marcha (<code>{backendUrl}</code>). Mostrando productos de ejemplo.
          </p>
        )}

        {products.length > 0 && <CatalogContent products={products} />}
      </div>
    </div>
  )
}
