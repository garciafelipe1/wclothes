"use client"

import { useState, useRef, useCallback } from "react"
import Image from "next/image"
import { useTranslations } from "next-intl"

type ProductImageGalleryProps = {
  title?: string
  thumbnail?: string
  images?: Array<{ url?: string }>
}

const THUMB_VISIBLE = 4

export function ProductImageGallery({ title, thumbnail, images }: ProductImageGalleryProps) {
  const t = useTranslations("pdp")
  const allImages: string[] = []
  if (thumbnail) allImages.push(thumbnail)
  const extra = (images ?? []).filter((i) => i.url && i.url !== thumbnail).map((i) => i.url!)
  allImages.push(...extra)
  const hasImages = allImages.length > 0
  const [activeIndex, setActiveIndex] = useState(0)
  const [thumbScroll, setThumbScroll] = useState(0)
  const [zoom, setZoom] = useState(false)
  const [pos, setPos] = useState({ x: 50, y: 50 })
  const mainRef = useRef<HTMLDivElement>(null)
  const mainUrl = allImages[activeIndex] ?? allImages[0]

  const maxScroll = Math.max(0, allImages.length - THUMB_VISIBLE)
  const canScrollUp = thumbScroll > 0
  const canScrollDown = thumbScroll < maxScroll

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!zoom || !mainRef.current) return
      const rect = mainRef.current.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width) * 100
      const y = ((e.clientY - rect.top) / rect.height) * 100
      setPos({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) })
    },
    [zoom]
  )

  const handleMouseEnter = useCallback(() => setZoom(true), [])
  const handleMouseLeave = useCallback(() => setZoom(false), [])

  const handleShare = useCallback(async () => {
    if (typeof navigator?.share === "function") {
      try {
        await navigator.share({
          title: title ?? "",
          url: typeof window !== "undefined" ? window.location.href : "",
        })
      } catch {
        if (typeof navigator?.clipboard?.writeText === "function") {
          await navigator.clipboard.writeText(window.location.href)
        }
      }
    } else if (typeof navigator?.clipboard?.writeText === "function") {
      await navigator.clipboard.writeText(window.location.href)
    }
  }, [title])

  if (!hasImages) {
    return (
      <div className="pdp-gallery pdp-gallery--empty">
        <div className="pdp-gallery__placeholder" />
      </div>
    )
  }

  return (
    <div className="pdp-gallery">
      {allImages.length > 1 && (
        <div className="pdp-gallery__thumbs-col">
          <button
            type="button"
            className="pdp-gallery__thumb-nav"
            onClick={() => setThumbScroll((s) => Math.max(0, s - 1))}
            disabled={!canScrollUp}
            aria-label={t("thumbPrev")}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 15l-6-6-6 6" />
            </svg>
          </button>
          <div className="pdp-gallery__thumbs-track">
            {allImages
              .slice(thumbScroll, thumbScroll + THUMB_VISIBLE)
              .map((url, i) => {
                const idx = thumbScroll + i
                return (
                  <button
                    key={url + idx}
                    type="button"
                    className={`pdp-gallery__thumb ${idx === activeIndex ? "pdp-gallery__thumb--active" : ""}`}
                    onClick={() => setActiveIndex(idx)}
                  >
                    <Image src={url} alt="" fill sizes="64px" />
                  </button>
                )
              })}
          </div>
          <button
            type="button"
            className="pdp-gallery__thumb-nav"
            onClick={() => setThumbScroll((s) => Math.min(maxScroll, s + 1))}
            disabled={!canScrollDown}
            aria-label={t("thumbNext")}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>
        </div>
      )}
      <div className="pdp-gallery__main-wrap">
        <div
          ref={mainRef}
          className={`pdp-gallery__main ${zoom ? "pdp-gallery__main--zoomed" : ""}`}
          onMouseMove={handleMouseMove}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <Image
            src={mainUrl}
            alt={title ?? ""}
            fill
            sizes="(max-width: 960px) 100vw, min(65vw, 900px)"
            priority
            className="pdp-gallery__img"
            style={zoom ? { transformOrigin: `${pos.x}% ${pos.y}%` } : undefined}
          />
        </div>
        <button type="button" className="pdp-gallery__share" onClick={handleShare}>
          ← {t("share")}
        </button>
      </div>
    </div>
  )
}
