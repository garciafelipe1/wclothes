import { getTranslations } from "next-intl/server"
import { getLocalizedPath } from "@/i18n/routing"
import { PDPProductCard, type PDPProductCardProduct } from "./PDPProductCard"

type CompleteTheLookProps = {
  products: PDPProductCardProduct[]
  locale: string
  countryCode: string
}

export async function CompleteTheLook({ products, locale, countryCode }: CompleteTheLookProps) {
  if (products.length === 0) return null

  const t = await getTranslations("pdp")

  return (
    <section className="pdp-complete" aria-label={t("styledWith")}>
      <h2 className="pdp-section__title">{t("styledWith")}</h2>
      <div className="pdp-complete__grid">
        {products.slice(0, 4).map((p) => {
          const href = p.handle ? getLocalizedPath(locale, countryCode, `/catalog/${p.handle}`) : "#"
          return <PDPProductCard key={p.id} product={p} href={href} />
        })}
      </div>
    </section>
  )
}
