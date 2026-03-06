"use client"

import { useSearchParams } from "next/navigation"
import { useTranslations } from "next-intl"

const SORT_OPTIONS = [
  { label: "Características", value: "" },
  { label: "Precio: menor a mayor", value: "price_asc" },
  { label: "Precio: mayor a menor", value: "price_desc" },
  { label: "Fecha: reciente a antiguo", value: "created_at_desc" },
  { label: "Fecha: antiguo a reciente", value: "created_at_asc" },
] as const

function IconFilter() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </svg>
  )
}

type CatalogToolbarProps = {
  productCount: number
  onFilterClick?: () => void
  filtersOpen?: boolean
  catalogPath: string
}

export default function CatalogToolbar({
  productCount,
  onFilterClick,
  filtersOpen,
  catalogPath,
}: CatalogToolbarProps) {
  const t = useTranslations("catalog")
  const searchParams = useSearchParams()
  const currentOrder = searchParams.get("order") ?? ""

  const buildSortUrl = (order: string) => {
    const params = new URLSearchParams(searchParams)
    if (order) params.set("order", order)
    else params.delete("order")
    params.delete("page")
    const qs = params.toString()
    return qs ? `${catalogPath}?${qs}` : catalogPath
  }

  return (
    <div className="catalog-toolbar">
      <button
        type="button"
        className={`catalog-toolbar-filter ${filtersOpen ? "is-open" : ""}`}
        onClick={onFilterClick}
        aria-label={t("filters")}
        aria-expanded={filtersOpen}
      >
        <span className="catalog-toolbar-filter-text">{t("filter")}</span>
        <IconFilter />
        <span className="catalog-toolbar-filter-chevron" aria-hidden>
          {filtersOpen ? "‹" : "›"}
        </span>
      </button>
      <span className="catalog-toolbar-count">
        {productCount} {t("products")}
      </span>
      <div className="catalog-toolbar-sort">
        <label htmlFor="catalog-sort" className="catalog-toolbar-sort-label">
          {t("sortBy")}
        </label>
        <select
          id="catalog-sort"
          className="catalog-toolbar-sort-select"
          value={currentOrder}
          onChange={(e) => {
            window.location.href = buildSortUrl(e.target.value)
          }}
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
