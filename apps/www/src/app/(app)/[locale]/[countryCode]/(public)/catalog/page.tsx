import Link from "next/link"
import { getTranslations } from "next-intl/server"
import { CatalogContent } from "@/components/catalog"
import type { CatalogProduct } from "@/components/catalog"
import { productService } from "@/services/product.service"
import { getLocalizedPath } from "@/i18n/routing"

function mapMedusaProduct(raw: Record<string, unknown>): CatalogProduct {
  const images = Array.isArray(raw.images) ? raw.images as Array<{ url?: string }> : []
  const thumbnail =
    (typeof raw.thumbnail === "string" && raw.thumbnail) || images[0]?.url || null
  const thumbnailHover = images.length > 1 && images[1]?.url ? images[1].url : null

  const variants = Array.isArray(raw.variants)
    ? (raw.variants as Array<{
        calculated_price?: { calculated_amount?: number; currency_code?: string }
        options?: Array<{ value?: string; option?: { title?: string } }>
      }>)
    : []

  const colorValues = new Set<string>()
  for (const v of variants) {
    for (const o of v.options ?? []) {
      if (o.option?.title === "Color" || o.option?.title === "Colour") {
        if (o.value) colorValues.add(o.value)
      }
    }
  }

  return {
    id: String(raw.id),
    title: typeof raw.title === "string" ? raw.title : null,
    handle: typeof raw.handle === "string" ? raw.handle : null,
    thumbnail,
    thumbnailHover: thumbnailHover || undefined,
    variants: variants.map((v) => ({
      calculated_price: v.calculated_price,
    })),
    colorValues: Array.from(colorValues),
  }
}

type CatalogPageProps = {
  params: Promise<{ locale: string; countryCode: string }>
  searchParams: Promise<{ page?: string; q?: string; order?: string; category?: string; sale?: string; color?: string; talle?: string; min_price?: string; max_price?: string }>
}

export default async function CatalogPage({ params, searchParams }: CatalogPageProps) {
  const { locale, countryCode } = await params
  const t = await getTranslations("catalog")
  const homePath = getLocalizedPath(locale, countryCode, "/")
  const catalogPath = getLocalizedPath(locale, countryCode, "/catalog")
  

  let products: CatalogProduct[] = []
  let error: string | null = null

  const search = await searchParams
  const page = search.page ? parseInt(search.page, 10) : 1
  const order = search.order as "price_asc" | "price_desc" | "created_at_asc" | "created_at_desc" | undefined
  const validOrder = ["price_asc", "price_desc", "created_at_asc", "created_at_desc"].includes(order ?? "")
    ? order
    : undefined
  const sale = search.sale === "1" || search.sale === "true"
  const minPrice = search.min_price ? parseInt(search.min_price, 10) : undefined
  const maxPrice = search.max_price ? parseInt(search.max_price, 10) : undefined

  const color = search.color?.trim() || undefined
  const talle = search.talle?.trim() || undefined
  let totalCount = 0

  try {
    const { products: list, info } = await productService.getAll({
      page: Number.isFinite(page) && page >= 1 ? page : 1,
      q: search.q?.trim() || undefined,
      order: validOrder,
      category: search.category?.trim() || undefined,
      sale: sale || undefined,
      color,
      talle,
      min_price: Number.isFinite(minPrice) ? minPrice : undefined,
      max_price: Number.isFinite(maxPrice) ? maxPrice : undefined,
    })
    products = list.map((p) => mapMedusaProduct(p as unknown as Record<string, unknown>))
    totalCount = info?.totalItems ?? products.length
  } catch (e) {
    error = e instanceof Error ? e.message : "Error al cargar productos"
  }

  const backendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9001"

  return (
    <div className="catalog-page">
      <div className="catalog-container">
        <nav className="catalog-breadcrumb" aria-label="Breadcrumb">
          <Link href={homePath}>{t("breadcrumbHome")}</Link>
          <span className="catalog-breadcrumb-sep" aria-hidden>›</span>
          <span>{t("breadcrumbCatalog")}</span>
        </nav>

        <header className="catalog-header">
          <h1 className="catalog-title">{t("title")}</h1>
          <p className="catalog-desc">{t("desc")}</p>
        </header>

        {error && (
          <p className="catalog-error">
            {t("loadError", { url: backendUrl })}
          </p>
        )}

        {products.length > 0 ? (
          <CatalogContent
            products={products}
            totalCount={typeof totalCount === "number" ? totalCount : products.length}
            activeFilters={{
              category: search.category?.trim() || undefined,
              color,
              talle,
              sale: sale || undefined,
              minPrice: Number.isFinite(minPrice) ? minPrice : undefined,
              maxPrice: Number.isFinite(maxPrice) ? maxPrice : undefined,
            }}
            catalogPath={catalogPath}
          />
        ) : (
          <section className="catalog-empty" aria-label="Sin resultados">
            <p className="catalog-empty-title">
              {error ? t("connectionError") : t("noResults")}
            </p>
            <p className="catalog-empty-desc">
              {error ? t("connectionErrorDesc") : t("noResultsDesc")}
            </p>
            <div className="catalog-empty-actions">
              <Link href={catalogPath} className="catalog-empty-link">
                {t("viewAllCatalog")}
              </Link>
              <Link href={homePath} className="catalog-empty-link catalog-empty-link--secondary">
                {t("backHome")}
              </Link>
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
