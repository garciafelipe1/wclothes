import Link from "next/link"
import { notFound } from "next/navigation"
import { productService } from "@/services/product.service"
import { getLocalizedPath } from "@/i18n/routing"
import { AddToCartButton } from "./_components/AddToCartButton"

type ProductPageProps = {
  params: Promise<{ locale: string; countryCode: string; handle: string }>
}

function formatPrice(amount?: number, code?: string): string {
  if (amount == null) return "—"
  const currency = code === "usd" ? "USD" : code === "ars" ? "ARS" : (code ?? "").toUpperCase()
  return `${(amount / 100).toLocaleString("es-AR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })} ${currency}`
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { locale, countryCode, handle } = await params
  const product = await productService.getByHandle(handle)
  if (!product) notFound()

  const homePath = getLocalizedPath(locale, countryCode, "/")
  const catalogPath = getLocalizedPath(locale, countryCode, "/catalog")

  const images = Array.isArray(product.images) ? product.images : []
  const mainImage = typeof product.thumbnail === "string" && product.thumbnail
    ? product.thumbnail
    : images[0]?.url ?? null
  const price = product.variants?.[0]?.calculated_price
  const displayPrice = formatPrice(price?.calculated_amount, price?.currency_code)
  const variantId = (product.variants?.[0] as { id?: string } | undefined)?.id

  return (
    <div className="catalog-page">
      <div className="catalog-container">
        <nav className="catalog-breadcrumb" aria-label="Breadcrumb">
          <Link href={homePath}>Inicio</Link>
          <span className="catalog-breadcrumb-sep" aria-hidden>›</span>
          <Link href={catalogPath}>Catálogo</Link>
          <span className="catalog-breadcrumb-sep" aria-hidden>›</span>
          <span>{product.title ?? handle}</span>
        </nav>

        <article className="flex flex-col gap-6 sm:flex-row">
          <div className="aspect-square w-full max-w-md overflow-hidden rounded bg-neutral-100">
            {mainImage && (
              <img
                src={mainImage}
                alt={product.title ?? ""}
                className="h-full w-full object-cover"
                width={600}
                height={600}
              />
            )}
          </div>
          <div className="flex flex-col gap-4">
            <h1 className="text-xl font-medium tracking-wide text-neutral-900">
              {product.title ?? "Sin título"}
            </h1>
            <p className="text-sm text-neutral-600">
              {(product as { description?: string }).description ?? ""}
            </p>
            <p className="text-base font-medium text-neutral-900">
              {displayPrice}
            </p>
            {variantId ? (
              <AddToCartButton
                variantId={variantId}
                countryCode={countryCode}
                locale={locale}
              />
            ) : (
              <p className="text-sm text-neutral-500">Sin variante disponible para agregar al carrito.</p>
            )}
          </div>
        </article>
      </div>
    </div>
  )
}
