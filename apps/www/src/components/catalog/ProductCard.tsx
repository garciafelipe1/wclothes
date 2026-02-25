import Link from "next/link"
import ProductImage from "./ProductImage"
import ProductInfo from "./ProductInfo"

export type CatalogProduct = {
  id: string
  title?: string | null
  handle?: string | null
  thumbnail?: string | null
  /** Segunda imagen: se muestra al pasar el mouse (hover) */
  thumbnailHover?: string | null
  variants?: Array<{
    calculated_price?: { calculated_amount?: number; currency_code?: string }
  }>
}

type ProductCardProps = {
  product: CatalogProduct
}

function formatPrice(amount?: number, code?: string): string {
  if (amount == null) return "—"
  const currency = code === "usd" ? "USD" : code === "ars" ? "ARS" : (code ?? "").toUpperCase()
  const value = (amount / 100).toLocaleString("es-AR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })
  return `${value} ${currency}`
}

export default function ProductCard({ product }: ProductCardProps) {
  const price = product.variants?.[0]?.calculated_price
  const amount = price?.calculated_amount
  const currency = price?.currency_code
  const displayPrice = formatPrice(amount, currency)
  const href = `/catalog/${product.handle ?? product.id}`

  return (
    <article className="h-full flex flex-col bg-transparent">
      <Link href={href} className="group flex flex-col h-full text-inherit no-underline">
        <ProductImage
          src={product.thumbnail}
          srcHover={product.thumbnailHover}
          alt={product.title ?? ""}
        />
        <ProductInfo
          title={product.title ?? "Sin título"}
          price={displayPrice}
          titleClassName="group-hover:underline"
        />
      </Link>
    </article>
  )
}
