import type { CatalogProduct } from "@/components/catalog"

const COLOR_OPTION_TITLES = ["Color", "Colour"]

/**
 * Maps Medusa store API product (raw) to catalog UI model.
 * Single place for this transformation (DRY, testable).
 */
export function mapMedusaProductToCatalog(
  raw: Record<string, unknown>
): CatalogProduct {
  const images = Array.isArray(raw.images)
    ? (raw.images as Array<{ url?: string }>)
    : []
  const thumbnail =
    (typeof raw.thumbnail === "string" && raw.thumbnail) || images[0]?.url || null
  const thumbnailHover =
    images.length > 1 && images[1]?.url ? images[1].url : null

  const variants = Array.isArray(raw.variants)
    ? (raw.variants as Array<{
        calculated_price?: {
          calculated_amount?: number
          currency_code?: string
        }
        options?: Array<{ value?: string; option?: { title?: string } }>
      }>)
    : []

  const colorValues = new Set<string>()
  for (const v of variants) {
    for (const o of v.options ?? []) {
      if (
        o.option &&
        COLOR_OPTION_TITLES.includes(o.option.title) &&
        o.value
      ) {
        colorValues.add(o.value)
      }
    }
  }

  return {
    id: String(raw.id),
    title: typeof raw.title === "string" ? raw.title : null,
    handle: typeof raw.handle === "string" ? raw.handle : null,
    thumbnail,
    thumbnailHover: thumbnailHover ?? undefined,
    variants: variants.map((v) => ({ calculated_price: v.calculated_price })),
    colorValues: Array.from(colorValues),
  }
}
