import ProductCard, { type CatalogProduct } from "./ProductCard"

type ProductGridProps = {
  products: CatalogProduct[]
}

export default function ProductGrid({ products }: ProductGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 gap-x-3 sm:gap-y-8 sm:gap-x-5 xl:gap-y-[60px] xl:gap-x-10 items-stretch">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
