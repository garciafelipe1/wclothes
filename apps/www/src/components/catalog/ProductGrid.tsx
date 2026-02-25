import ProductCard, { type CatalogProduct } from "./ProductCard"

type ProductGridProps = {
  products: CatalogProduct[]
}

export default function ProductGrid({ products }: ProductGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 gap-x-4 sm:gap-y-10 sm:gap-x-6 md:gap-y-12 md:gap-x-8 lg:gap-y-[60px] lg:gap-x-10 items-stretch">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
