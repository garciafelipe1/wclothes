"use client"

import { useState } from "react"
import CatalogToolbar from "./CatalogToolbar"
import CatalogGrid from "./CatalogGrid"
import type { CatalogProduct } from "./ProductCard"

type ViewCols = 2 | 4 | 8

const FEATURE_VIDEO_SRC =
  "https://int.toteme.com/cdn/shop/videos/c/vp/1de7df5259c54985bd34985f63a19184/1de7df5259c54985bd34985f63a19184.m3u8?v=0"

type CatalogContentProps = {
  products: CatalogProduct[]
  totalItems?: number
  totalPages?: number
}

export default function CatalogContent({
  products,
  totalItems: totalItemsProp,
  totalPages,
}: CatalogContentProps) {
  const [view, setView] = useState<ViewCols>(4)
  const totalItems = totalItemsProp ?? products.length

  return (
    <>
      <CatalogToolbar
        view={view}
        onViewChange={setView}
        totalItems={totalItems}
        onFilterClick={() => {}}
      />
      <CatalogGrid
        products={products}
        featureVideoSrc={FEATURE_VIDEO_SRC}
      />
    </>
  )
}
