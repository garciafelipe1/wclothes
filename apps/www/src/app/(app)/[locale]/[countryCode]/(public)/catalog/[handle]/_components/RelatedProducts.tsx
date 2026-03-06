import { getLocalizedPath } from "@/i18n/routing"
import { PDPProductCard, type PDPProductCardProduct } from "./PDPProductCard"

type RelatedProductsProps = {
  products: PDPProductCardProduct[]
  title?: string
  locale: string
  countryCode: string
}

export function RelatedProducts({
  products,
  title = "You may also like",
  locale,
  countryCode,
}: RelatedProductsProps) {
  if (products.length === 0) return null

  return (
    <section className="pdp-related" aria-label={title}>
      <h2 className="pdp-section__title">{title}</h2>
      <div className="pdp-related__grid">
        {products.map((p) => {
          const href = p.handle ? getLocalizedPath(locale, countryCode, `/catalog/${p.handle}`) : "#"
          return <PDPProductCard key={p.id} product={p} href={href} />
        })}
      </div>
    </section>
  )
}
