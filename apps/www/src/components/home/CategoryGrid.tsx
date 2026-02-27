import Link from "next/link"

type Category = {
  title: string
  image: string
  href: string
}

type CategoryGridProps = {
  categories: Category[]
}

export default function CategoryGrid({ categories }: CategoryGridProps) {
  return (
    <section className="home-categories">
      <div className="home-categories__grid">
        {categories.map((cat) => (
          <Link key={cat.title} href={cat.href} className="home-categories__item">
            <div
              className="home-categories__image"
              style={{ backgroundImage: `url(${cat.image})` }}
            />
            <div className="home-categories__overlay" />
            <span className="home-categories__label">{cat.title}</span>
          </Link>
        ))}
      </div>
    </section>
  )
}
