import ProductCard, { type CatalogProduct } from "./ProductCard"

type CatalogFeatureRowProps = {
  leftProducts: [CatalogProduct, CatalogProduct]
  rightProducts: [CatalogProduct, CatalogProduct]
  videoSrc?: string
  videoPoster?: string
}

const DEFAULT_VIDEO =
  "https://cdn.coverr.co/videos/coverr-woman-walking-in-minimalist-shoe-store-4698191/4698191_preview.mp4"

export default function CatalogFeatureRow({
  leftProducts,
  rightProducts,
  videoSrc = DEFAULT_VIDEO,
  videoPoster,
}: CatalogFeatureRowProps) {
  return (
    <div className="catalog-feature-row">
      <div className="catalog-feature-row__side">
        <ProductCard product={leftProducts[0]} />
        <ProductCard product={leftProducts[1]} />
      </div>
      <div className="catalog-feature-row__video-wrap">
        <video
          className="catalog-feature-row__video"
          src={videoSrc}
          poster={videoPoster}
          playsInline
          muted
          loop
          autoPlay
          controls
          aria-label="Video destacado"
        />
      </div>
      <div className="catalog-feature-row__side">
        <ProductCard product={rightProducts[0]} />
        <ProductCard product={rightProducts[1]} />
      </div>
    </div>
  )
}
