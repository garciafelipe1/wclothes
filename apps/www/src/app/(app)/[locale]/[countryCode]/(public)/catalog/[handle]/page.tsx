import Link from "next/link"
import { notFound } from "next/navigation"
import { getTranslations } from "next-intl/server"
import { productService } from "@/services/product.service"
import { getLocalizedPath } from "@/i18n/routing"
import {
  ProductImageGallery,
  ProductHeroSidebar,
  ProductDetailsAccordion,
  CompleteTheLook,
  RelatedProducts,
} from "./_components"

type ProductPageProps = {
  params: Promise<{ locale: string; countryCode: string; handle: string }>
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { locale, countryCode, handle } = await params
  const t = await getTranslations("catalog")
  const tPdp = await getTranslations("pdp")

  const product = await productService.getByHandle(handle)
  if (!product) notFound()

  const homePath = getLocalizedPath(locale, countryCode, "/")
  const catalogPath = getLocalizedPath(locale, countryCode, "/catalog")
  const sizeGuidePath = getLocalizedPath(locale, countryCode, "/catalog#size-guide")
  const rawVariants = Array.isArray(product.variants) ? product.variants : []
  const variants = rawVariants.map((v) => ({ ...v, id: (v as { id?: string }).id ?? "" })).filter((v) => v.id)
  const metadata = (product as { metadata?: Record<string, string> }).metadata ?? {}

  const relatedRaw = await productService.getRelated(product.id, 8)
  const relatedForLook = relatedRaw.slice(0, 4)
  const relatedForYou = relatedRaw

  const description = product.description ?? metadata.description ?? ""
  const materials = metadata.materials ?? metadata.fabric ?? ""
  const fit = metadata.fit ?? metadata.sizing ?? ""
  const care = metadata.care ?? metadata.care_instructions ?? ""

  const breadcrumb = (
    <nav className="pdp__breadcrumb" aria-label="Breadcrumb">
      <Link href={homePath}>{t("breadcrumbHome")}</Link>
      <span className="pdp__breadcrumb-sep" aria-hidden>›</span>
      <Link href={catalogPath}>{t("breadcrumbCatalog")}</Link>
      <span className="pdp__breadcrumb-sep" aria-hidden>›</span>
      <span>{product.title ?? handle}</span>
    </nav>
  )

  return (
    <div className="pdp">
      <div className="pdp__container">
        <section className="pdp__hero" aria-label="Product">
          <div className="pdp__hero-gallery">
            <ProductImageGallery
              title={product.title ?? undefined}
              thumbnail={typeof product.thumbnail === "string" ? product.thumbnail : undefined}
              images={Array.isArray(product.images) ? product.images : undefined}
            />
          </div>
          <div className="pdp__hero-sidebar">
            {breadcrumb}
            <ProductHeroSidebar
              product={{
                id: product.id,
                title: product.title ?? undefined,
                description: description || undefined,
                handle: product.handle,
                options: (product as { options?: Array<{ id?: string; title?: string }> }).options ?? undefined,
                thumbnail: typeof product.thumbnail === "string" ? product.thumbnail : undefined,
                images: Array.isArray(product.images) ? product.images : undefined,
              }}
              variants={variants}
              countryCode={countryCode}
              sizeGuidePath={sizeGuidePath}
            />
          </div>
        </section>

        <div className="pdp__details-row">
          <ProductDetailsAccordion
            description={description}
            materials={materials}
            fit={fit}
            care={care}
          />
        </div>

        <CompleteTheLook products={relatedForLook} locale={locale} countryCode={countryCode} />
        <RelatedProducts
          products={relatedForYou}
          title={tPdp("youMayAlsoLike")}
          locale={locale}
          countryCode={countryCode}
        />
      </div>
    </div>
  )
}
