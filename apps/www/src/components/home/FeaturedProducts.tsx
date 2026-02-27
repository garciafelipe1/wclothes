import Link from "next/link"

type Product = {
  id: string
  title: string | null
  handle: string | null
  thumbnail: string | null
  price?: string
}

type FeaturedProductsProps = {
  products: Product[]
  catalogPath: string
}

export default function FeaturedProducts({ products, catalogPath }: FeaturedProductsProps) {
  if (!products.length) return null

  return (
    <div className="home-featured-wrap">
    <section className="home-featured">
      <div className="home-featured__header">
        <h2 className="home-featured__title">NUEVOS INGRESOS</h2>
        <Link href={catalogPath} className="home-featured__viewall">
          Ver todo →
        </Link>
      </div>
      <div className="home-featured__grid">
        {products.map((p) => (
          <Link
            key={p.id}
            href={p.handle ? `${catalogPath}/${p.handle}` : catalogPath}
            className="home-featured__card"
          >
            <div className="home-featured__img-wrap">
              {p.thumbnail ? (
                <img src={p.thumbnail} alt={p.title || ""} className="home-featured__img" />
              ) : (
                <div className="home-featured__img-placeholder" />
              )}
            </div>
            <div className="home-featured__info">
              <span className="home-featured__name">{p.title}</span>
              {p.price && <span className="home-featured__price">{p.price}</span>}
            </div>
          </Link>
        ))}
      </div>
    </section>
    </div>
  )
}
