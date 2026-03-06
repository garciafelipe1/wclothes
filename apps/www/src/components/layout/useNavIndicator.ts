"use client"

import { useState, useEffect, useCallback, useRef } from "react"

export function useNavIndicator(catalogMegaOpen: boolean) {
  const linksWrapRef = useRef<HTMLDivElement>(null)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [indicatorStyle, setIndicatorStyle] = useState<{ left: number; width: number }>({ left: 0, width: 0 })
  const activeIndexRef = useRef<number | null>(null)

  const activeIndex = catalogMegaOpen ? 2 : hoveredIndex
  activeIndexRef.current = activeIndex

  const updateIndicator = useCallback(() => {
    const idx = activeIndexRef.current
    const wrap = linksWrapRef.current
    if (idx === null || !wrap || idx < 0 || idx > 2) {
      setIndicatorStyle({ left: 0, width: 0 })
      return
    }
    const itemEl = wrap.children[idx] as HTMLElement | undefined
    if (!itemEl) {
      setIndicatorStyle({ left: 0, width: 0 })
      return
    }
    const wrapRect = wrap.getBoundingClientRect()
    const itemRect = itemEl.getBoundingClientRect()
    setIndicatorStyle({
      left: itemRect.left - wrapRect.left,
      width: itemRect.width,
    })
  }, [])

  useEffect(() => {
    updateIndicator()
    const onResize = () => updateIndicator()
    window.addEventListener("resize", onResize)
    return () => window.removeEventListener("resize", onResize)
  }, [activeIndex, updateIndicator])

  return { linksWrapRef, hoveredIndex, setHoveredIndex, activeIndex, indicatorStyle }
}
