"use client"

type ViewCols = 2 | 4 | 8

type CatalogToolbarProps = {
  view: ViewCols
  onViewChange: (v: ViewCols) => void
  totalItems: number
  onFilterClick?: () => void
}

export default function CatalogToolbar({ view, onViewChange, totalItems, onFilterClick }: CatalogToolbarProps) {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <div className="catalog-toolbar">
      <span className="catalog-toolbar-count">
        {totalItems} {totalItems === 1 ? "producto" : "productos"}
      </span>
      <div className="catalog-toolbar-view">
        <span className="catalog-toolbar-view-label">Vista</span>
        {([2, 4, 8] as const).map((n) => (
          <button
            key={n}
            type="button"
            className={`catalog-toolbar-view-btn ${view === n ? "is-active" : ""}`}
            onClick={() => onViewChange(n)}
            aria-pressed={view === n}
            aria-label={`Ver ${n} columnas`}
          >
            {n}
          </button>
        ))}
      </div>
      <button
        type="button"
        className="catalog-toolbar-filter"
        onClick={onFilterClick}
        aria-label="Filtrar"
      >
        + Filtrar
      </button>
      <button
        type="button"
        className="catalog-toolbar-back"
        onClick={scrollToTop}
        aria-label="Volver arriba"
      >
        Volver arriba
      </button>
    </div>
  )
}
