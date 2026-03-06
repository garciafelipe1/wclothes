"use client"

import { useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useTranslations } from "next-intl"
import { getColorSwatch } from "@/lib/color-swatches"

export const CATALOG_CATEGORIES = ["Calzado", "Remeras"] as const

export const FILTER_COLORS = [
  "Negro",
  "Blanco",
  "Gris",
  "Castaño",
  "Flamenco",
  "Azul marino",
  "Rayas",
  "Crudo",
  "Natural",
] as const

export const FILTER_TALLES = ["1", "2", "3", "4"] as const

export type ActiveFilters = {
  category?: string
  color?: string
  talle?: string
  sale?: boolean
  minPrice?: number
  maxPrice?: number
}

type CatalogFiltersProps = {
  catalogPath: string
  activeFilters: ActiveFilters
  productCount: number
  onClose?: () => void
}

function buildFilterUrl(
  base: string,
  current: URLSearchParams,
  overrides: Record<string, string | undefined>
) {
  const params = new URLSearchParams(current)
  for (const [key, val] of Object.entries(overrides)) {
    if (val === undefined || val === "") params.delete(key)
    else params.set(key, val)
  }
  params.delete("page")
  const qs = params.toString()
  return qs ? `${base}?${qs}` : base
}

export default function CatalogFilters({
  catalogPath,
  activeFilters,
  productCount,
  onClose,
}: CatalogFiltersProps) {
  const t = useTranslations("catalog")
  const searchParams = useSearchParams()
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    category: true,
    color: true,
    talle: true,
    promotions: true,
  })

  const merge = (overrides: Record<string, string | undefined>) =>
    buildFilterUrl(catalogPath, searchParams, overrides)

  const toggleSection = (key: string) =>
    setOpenSections((s) => ({ ...s, [key]: !s[key] }))

  const handleFilterClick = () => onClose?.()

  const activeChips: Array<{ key: string; label: string }> = []
  if (activeFilters.category) activeChips.push({ key: "category", label: activeFilters.category })
  if (activeFilters.color) activeChips.push({ key: "color", label: activeFilters.color })
  if (activeFilters.talle) activeChips.push({ key: "talle", label: `Talle ${activeFilters.talle}` })
  if (activeFilters.sale) activeChips.push({ key: "sale", label: t("onSale") })
  const hasActiveFilters = activeChips.length > 0

  return (
    <aside className="catalog-filters" aria-label={t("filters")}>
      <div className="catalog-filters__header">
        <button
          type="button"
          className="catalog-filters__back"
          onClick={onClose}
          aria-label={t("closeFilters")}
        >
          ‹
        </button>
        <h3 className="catalog-filters__title">{t("filter")}</h3>
        <span className="catalog-filters__count">
          {productCount} {t("products")}
        </span>
      </div>

      {hasActiveFilters && (
        <div className="catalog-filters__chips">
          {activeChips.map((chip) => (
            <Link
              key={chip.key}
              href={
                chip.key === "category"
                  ? merge({ category: undefined })
                  : chip.key === "color"
                    ? merge({ color: undefined })
                    : chip.key === "talle"
                      ? merge({ talle: undefined })
                      : merge({ sale: undefined })
              }
              className="catalog-filters__chip"
              onClick={handleFilterClick}
            >
              {chip.label} ×
            </Link>
          ))}
          <Link href={catalogPath} className="catalog-filters__clear-all" onClick={handleFilterClick}>
            {t("clearAll")}
          </Link>
        </div>
      )}

      <div className="catalog-filters__sections">
        <div className="catalog-filters__section">
          <button
            type="button"
            className="catalog-filters__section-head"
            onClick={() => toggleSection("category")}
            aria-expanded={openSections.category}
          >
            <span>{t("category")}</span>
            <span className="catalog-filters__chevron">{openSections.category ? "˄" : "˅"}</span>
          </button>
          {openSections.category && (
            <div className="catalog-filters__section-body">
              {CATALOG_CATEGORIES.map((cat) => (
                <Link
                  key={cat}
                  href={merge({ category: activeFilters.category === cat ? undefined : cat })}
                  className={`catalog-filters__option ${activeFilters.category === cat ? "is-active" : ""}`}
                  onClick={handleFilterClick}
                >
                  <span className="catalog-filters__checkbox">
                    {activeFilters.category === cat ? "☑" : "☐"}
                  </span>
                  {cat}
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="catalog-filters__section">
          <button
            type="button"
            className="catalog-filters__section-head"
            onClick={() => toggleSection("color")}
            aria-expanded={openSections.color}
          >
            <span>{t("color")}</span>
            <span className="catalog-filters__chevron">{openSections.color ? "˄" : "˅"}</span>
          </button>
          {openSections.color && (
            <div className="catalog-filters__section-body catalog-filters__colors">
              {FILTER_COLORS.map((color) => {
                const isActive = activeFilters.color === color
                const swatch = getColorSwatch(color)
                return (
                  <Link
                    key={color}
                    href={merge({ color: isActive ? undefined : color })}
                    className={`catalog-filters__color-opt ${isActive ? "is-active" : ""}`}
                    onClick={handleFilterClick}
                  >
                    <span
                      className="catalog-filters__swatch"
                      style={{
                        background: swatch.startsWith("linear") ? swatch : swatch,
                        borderColor: swatch.startsWith("#") && swatch !== "#ffffff" ? swatch : "#e5e7eb",
                      }}
                    />
                    {isActive && <span className="catalog-filters__check">✓</span>}
                    <span className="catalog-filters__color-name">{color}</span>
                  </Link>
                )
              })}
            </div>
          )}
        </div>

        <div className="catalog-filters__section">
          <button
            type="button"
            className="catalog-filters__section-head"
            onClick={() => toggleSection("talle")}
            aria-expanded={openSections.talle}
          >
            <span>{t("talle")}</span>
            <span className="catalog-filters__chevron">{openSections.talle ? "˄" : "˅"}</span>
          </button>
          {openSections.talle && (
            <div className="catalog-filters__section-body">
              {FILTER_TALLES.map((t) => (
                <Link
                  key={t}
                  href={merge({ talle: activeFilters.talle === t ? undefined : t })}
                  className={`catalog-filters__option ${activeFilters.talle === t ? "is-active" : ""}`}
                  onClick={handleFilterClick}
                >
                  <span className="catalog-filters__checkbox">
                    {activeFilters.talle === t ? "☑" : "☐"}
                  </span>
                  {t}
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="catalog-filters__section">
          <button
            type="button"
            className="catalog-filters__section-head"
            onClick={() => toggleSection("promotions")}
            aria-expanded={openSections.promotions}
          >
            <span>{t("promotions")}</span>
            <span className="catalog-filters__chevron">{openSections.promotions ? "˄" : "˅"}</span>
          </button>
          {openSections.promotions && (
            <div className="catalog-filters__section-body">
              <Link
                href={merge({ sale: undefined })}
                className={`catalog-filters__option ${!activeFilters.sale ? "is-active" : ""}`}
                onClick={handleFilterClick}
              >
                <span className="catalog-filters__checkbox">{!activeFilters.sale ? "☑" : "☐"}</span>
                {t("all")}
              </Link>
              <Link
                href={merge({ sale: activeFilters.sale ? undefined : "1" })}
                className={`catalog-filters__option ${activeFilters.sale ? "is-active" : ""}`}
                onClick={handleFilterClick}
              >
                <span className="catalog-filters__checkbox">{activeFilters.sale ? "☑" : "☐"}</span>
                {t("onSale")}
              </Link>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}
