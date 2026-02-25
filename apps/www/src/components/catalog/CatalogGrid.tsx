import ProductGrid from "./ProductGrid"
import CatalogFeatureRow from "./CatalogFeatureRow"
import type { CatalogProduct } from "./ProductCard"

type CatalogGridProps = {
  products: CatalogProduct[]
  /** URL del video para la fila destacada (2ª fila: producto | video | producto). Si no se pasa, no se muestra la fila. */
  featureVideoSrc?: string
}

const FIRST_ROW_COUNT = 4
const FEATURE_ROW_PRODUCTS = 4

export default function CatalogGrid({ products, featureVideoSrc }: CatalogGridProps) {
  const hasFeatureRow =
    featureVideoSrc !== undefined &&
    products.length >= FIRST_ROW_COUNT + FEATURE_ROW_PRODUCTS

  const firstRow = products.slice(0, FIRST_ROW_COUNT)
  const featureLeft = hasFeatureRow ? [products[4], products[5]] : []
  const featureRight = hasFeatureRow ? [products[6], products[7]] : []
  const rest = hasFeatureRow ? products.slice(FIRST_ROW_COUNT + FEATURE_ROW_PRODUCTS) : products.slice(FIRST_ROW_COUNT)

  return (
    <div className="catalog-grid-wrap">
      {firstRow.length > 0 && <ProductGrid products={firstRow} />}

      {hasFeatureRow && featureLeft.length === 2 && featureRight.length === 2 && (
        <CatalogFeatureRow
          leftProducts={featureLeft}
          rightProducts={featureRight}
          videoSrc={featureVideoSrc}
        />
      )}

      {rest.length > 0 && <ProductGrid products={rest} />}
    </div>
  )
}
