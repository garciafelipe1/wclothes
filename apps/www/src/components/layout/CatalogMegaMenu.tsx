"use client"

import { useEffect, useCallback, useRef } from "react"
import Link from "next/link"

const MEGA_MAIN_LINKS = [
  { label: "NEW IN", href: "/catalog?new=1" },
  { label: "BEST SELLERS", href: "/catalog?filter=best-sellers" },
  { label: "TSSY", href: "/catalog?filter=tssy", highlight: true },
  { label: "DENIM", href: "/catalog?category=Denim" },
]

const MEGA_ROPA = [
  { label: "POLOS", href: "/catalog?category=Polos" },
  { label: "REMERAS", href: "/catalog?category=Remeras" },
  { label: "BUZOS", href: "/catalog?category=Buzos" },
  { label: "PANTS", href: "/catalog?category=Pants" },
  { label: "SWEATERS", href: "/catalog?category=Sweaters" },
  { label: "CROPS", href: "/catalog?category=Crops" },
  { label: "CAMISAS", href: "/catalog?category=Camisas" },
  { label: "SHORTS", href: "/catalog?category=Shorts" },
  { label: "MUSCULOSAS", href: "/catalog?category=Musculosas" },
  { label: "CAMPERAS", href: "/catalog?category=Camperas" },
]

const MEGA_ACCESORIOS = [
  { label: "GORRAS", href: "/catalog?category=Gorras" },
  { label: "PAÑUELOS", href: "/catalog?category=Panuelos" },
  { label: "BOLSOS", href: "/catalog?category=Bolsos" },
  { label: "ROPA INTERIOR", href: "/catalog?category=Ropa-interior" },
  { label: "MEDIAS", href: "/catalog?category=Medias" },
  { label: "PERFUMINAS", href: "/catalog?category=Perfuminas" },
  { label: "PINES", href: "/catalog?category=Pines" },
  { label: "LLAVERO", href: "/catalog?category=Llavero" },
]

type CatalogMegaMenuProps = {
  open: boolean
  onOpen: () => void
  onClose: () => void
  toPath: (path: string) => string
}

export default function CatalogMegaMenu({ open, onOpen, onClose, toPath }: CatalogMegaMenuProps) {
  const megaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onEscape = (e: KeyboardEvent) => e.key === "Escape" && onClose()
    document.addEventListener("keydown", onEscape)
    return () => document.removeEventListener("keydown", onEscape)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="catalog-dropdown"
      ref={megaRef}
      role="dialog"
      aria-label="Catálogo"
      onMouseEnter={onOpen}
      onMouseLeave={onClose}
    >
      <div className="catalog-dropdown__inner">
        <div className="catalog-dropdown__col">
          <ul className="catalog-dropdown__list">
            {MEGA_MAIN_LINKS.map((l) => (
              <li key={l.label}>
                <Link
                  href={toPath(l.href)}
                  className={`catalog-dropdown__link ${l.highlight ? "catalog-dropdown__link--highlight" : ""}`}
                  onClick={onClose}
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="catalog-dropdown__col">
          <p className="catalog-dropdown__title">ROPA</p>
          <ul className="catalog-dropdown__list">
            {MEGA_ROPA.map((l) => (
              <li key={l.label}>
                <Link href={toPath(l.href)} className="catalog-dropdown__link" onClick={onClose}>
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="catalog-dropdown__col">
          <p className="catalog-dropdown__title">ACCESORIOS</p>
          <ul className="catalog-dropdown__list">
            {MEGA_ACCESORIOS.map((l) => (
              <li key={l.label}>
                <Link href={toPath(l.href)} className="catalog-dropdown__link" onClick={onClose}>
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
