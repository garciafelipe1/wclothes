"use client"

import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { useTranslations } from "next-intl"
import CatalogToolbar from "./CatalogToolbar"
import CatalogGrid from "./CatalogGrid"
import CatalogFilters from "./CatalogFilters"
import type { CatalogProduct } from "./ProductCard"
import type { ActiveFilters } from "./CatalogFilters"

const FEATURE_VIDEO_SRC =
  "https://int.toteme.com/cdn/shop/videos/c/vp/1de7df5259c54985bd34985f63a19184/1de7df5259c54985bd34985f63a19184.m3u8?v=0"

const MOBILE_BREAKPOINT = 900

type CatalogContentProps = {
  products: CatalogProduct[]
  totalCount: number
  activeFilters?: ActiveFilters
  catalogPath?: string
}

export default function CatalogContent({
  products,
  totalCount,
  activeFilters = {},
  catalogPath = "/catalog",
}: CatalogContentProps) {
  const t = useTranslations("catalog")
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT)
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])

  useEffect(() => {
    if (!filtersOpen || !isMobile) return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = prev
    }
  }, [filtersOpen, isMobile])

  const closeFilters = () => setFiltersOpen(false)

  const showMobileSheet = filtersOpen && isMobile

  const mobileSheet =
    showMobileSheet &&
    typeof document !== "undefined" &&
    createPortal(
      <div className="catalog-filters-mobile-sheet">
        <button
          type="button"
          className="catalog-filters-backdrop"
          onClick={closeFilters}
          aria-label={t("closeFilters")}
        />
        <div className="catalog-filters-mobile-panel">
          <CatalogFilters
            catalogPath={catalogPath}
            activeFilters={activeFilters}
            productCount={totalCount}
            onClose={closeFilters}
          />
        </div>
      </div>,
      document.body
    )

  return (
    <div
      className={`catalog-content ${filtersOpen ? "catalog-content--filters-open" : ""}${showMobileSheet ? " catalog-content--mobile-sheet" : ""}`}
    >
      <CatalogToolbar
        productCount={totalCount}
        onFilterClick={() => setFiltersOpen((o) => !o)}
        filtersOpen={filtersOpen}
        catalogPath={catalogPath}
      />
      <div className="catalog-main">
        <div className="catalog-filters-wrap">
          <CatalogFilters
            catalogPath={catalogPath}
            activeFilters={activeFilters}
            productCount={totalCount}
            onClose={closeFilters}
          />
        </div>
        <CatalogGrid
          products={products}
          featureVideoSrc={FEATURE_VIDEO_SRC}
        />
      </div>
      {mobileSheet}
    </div>
  )
}
