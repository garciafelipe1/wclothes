type StickyStackSectionProps = {
  image: string
  title: string
  description?: string
  ctaText?: string
  ctaHref?: string
  zIndex: number
}

export default function StickyStackSection({
  image,
  title,
  description,
  ctaText,
  ctaHref = "/catalog",
  zIndex,
}: StickyStackSectionProps) {
  return (
    <section
      className="sticky-stack-section"
      style={{
        zIndex,
        backgroundImage: `url(${image})`,
      }}
    >
      <div className="sticky-stack-section__overlay" />
      <div className="sticky-stack-section__content">
        <h2 className="sticky-stack-section__title">{title}</h2>
        {description && (
          <p className="sticky-stack-section__desc">{description}</p>
        )}
        {ctaText && (
          <a href={ctaHref} className="sticky-stack-section__cta">
            {ctaText}
          </a>
        )}
      </div>
    </section>
  )
}
