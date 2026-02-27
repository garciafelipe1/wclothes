"use client"

import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useState, useEffect, useCallback, useRef } from "react"
import { createPortal } from "react-dom"
import { useLocaleCountry } from "@/app/context/locale-country"
import { useCartDrawer } from "@/app/context/cart-drawer"
import { getLocalizedPath } from "@/i18n/routing"

type NavItem = {
  label: string
  href: string
  hasMega?: boolean
}

const NAV_ITEMS: NavItem[] = [
  { label: "NUEVOS INGRESOS", href: "/catalog?new=1" },
  { label: "COLECCIONES EXCLUSIVAS", href: "/catalog?filter=colecciones-exclusivas" },
  { label: "CATÁLOGO", href: "/catalog", hasMega: true },
]

/* Megamenú: columnas principales + ROPA + ACCESORIOS + imágenes (estilo Tussy) */
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

function FlagArgentina({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 14" width="20" height="14" role="img" aria-label="Argentina" preserveAspectRatio="xMidYMid slice">
      <rect width="20" height="14" fill="#75AADB" />
      <rect y="4.67" width="20" height="4.67" fill="#fff" />
      <circle cx="10" cy="7" r="2.2" fill="#F4D03F" />
    </svg>
  )
}

function FlagUSA({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 14" width="20" height="14" role="img" aria-label="USA" preserveAspectRatio="xMidYMid slice">
      <rect width="8" height="14" fill="#3C3B6E" />
      <rect x="8" width="12" height="2" fill="#fff" />
      <rect x="8" y="4" width="12" height="2" fill="#B22234" />
      <rect x="8" y="8" width="12" height="2" fill="#fff" />
      <rect x="8" y="12" width="12" height="2" fill="#B22234" />
    </svg>
  )
}

export default function MainNav(): JSX.Element {
  const router = useRouter()
  const { locale: urlLocale, countryCode } = useLocaleCountry()
  const { openCart, cartCount } = useCartDrawer()
  const [menuOpen, setMenuOpen] = useState(false)
  const [catalogMegaOpen, setCatalogMegaOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const searchInputRef = useRef<HTMLInputElement>(null)
  const searchStripRef = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)
  const [langOpen, setLangOpen] = useState(false)
  const [currencyOpen, setCurrencyOpen] = useState(false)
  const [locale, setLocale] = useState<"es" | "en">(urlLocale)
  const [currency, setCurrency] = useState<"ARS" | "USD">("ARS")
  const megaRef = useRef<HTMLDivElement>(null)
  const toPath = useCallback((path: string) => getLocalizedPath(urlLocale, countryCode, path), [urlLocale, countryCode])
  const catalogTriggerRef = useRef<HTMLDivElement>(null)
  const catalogCloseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const linksWrapRef = useRef<HTMLDivElement>(null)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [indicatorStyle, setIndicatorStyle] = useState<{ left: number; width: number }>({ left: 0, width: 0 })
  const activeIndexRef = useRef<number | null>(null)
  const activeIndex = catalogMegaOpen ? 2 : hoveredIndex
  activeIndexRef.current = activeIndex

  const closeMenu = useCallback(() => setMenuOpen(false), [])
  const closeMega = useCallback(() => setCatalogMegaOpen(false), [])

  const openSearch = useCallback(() => {
    setSearchOpen(true)
    setSearchQuery("")
  }, [])
  const closeSearch = useCallback(() => {
    setSearchOpen(false)
    setSearchQuery("")
  }, [])
  const handleSearchSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      const q = searchQuery.trim()
      if (q) {
        router.push(toPath(`/catalog?q=${encodeURIComponent(q)}`))
        closeSearch()
      }
    },
    [searchQuery, router, toPath, closeSearch]
  )

  useEffect(() => {
    if (searchOpen) {
      searchInputRef.current?.focus()
      const handleClickOutside = (e: MouseEvent) => {
        if (searchStripRef.current && !searchStripRef.current.contains(e.target as Node)) {
          closeSearch()
        }
      }
      document.addEventListener("mousedown", handleClickOutside)
      return () => document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [searchOpen, closeSearch])

  const openMega = useCallback(() => {
    if (catalogCloseTimeoutRef.current) {
      clearTimeout(catalogCloseTimeoutRef.current)
      catalogCloseTimeoutRef.current = null
    }
    setCatalogMegaOpen(true)
  }, [])

  const scheduleCloseMega = useCallback(() => {
    catalogCloseTimeoutRef.current = setTimeout(() => {
      catalogCloseTimeoutRef.current = null
      setCatalogMegaOpen(false)
    }, 150)
  }, [])

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (mounted) {
      const savedLocale = localStorage.getItem("locale") as "es" | "en" | null
      const savedCurrency = localStorage.getItem("currency") as "ARS" | "USD" | null
      if (savedLocale === "es" || savedLocale === "en") setLocale(savedLocale)
      if (savedCurrency === "ARS" || savedCurrency === "USD") setCurrency(savedCurrency)
    }
  }, [mounted])

  useEffect(() => {
    if (typeof document !== "undefined") document.documentElement.lang = locale
    if (mounted) {
      localStorage.setItem("locale", locale)
      localStorage.setItem("currency", currency)
    }
  }, [locale, currency, mounted])

  useEffect(() => {
    if (!menuOpen) return
    const onEscape = (e: KeyboardEvent) => e.key === "Escape" && closeMenu()
    document.body.style.overflow = "hidden"
    document.addEventListener("keydown", onEscape)
    return () => {
      document.removeEventListener("keydown", onEscape)
      document.body.style.overflow = ""
    }
  }, [menuOpen, closeMenu])

  useEffect(() => {
    if (!catalogMegaOpen) return
    const onEscape = (e: KeyboardEvent) => e.key === "Escape" && closeMega()
    document.addEventListener("keydown", onEscape)
    return () => document.removeEventListener("keydown", onEscape)
  }, [catalogMegaOpen, closeMega])

  useEffect(() => {
    if (!searchOpen) return
    const onEscape = (e: KeyboardEvent) => e.key === "Escape" && closeSearch()
    document.addEventListener("keydown", onEscape)
    return () => document.removeEventListener("keydown", onEscape)
  }, [searchOpen, closeSearch])

  useEffect(() => {
    return () => {
      if (catalogCloseTimeoutRef.current) clearTimeout(catalogCloseTimeoutRef.current)
    }
  }, [])

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

  return (
    <header className="main-header">
      <nav className="main-nav" aria-label="Principal">
        <div className="nav-bar-wrap">
          <div className="nav-left">
            <button
              type="button"
              className="nav-hamburger"
              aria-label="Abrir menú"
              aria-expanded={menuOpen}
              aria-controls="nav-drawer"
              onClick={() => setMenuOpen((o) => !o)}
            >
              <span className="nav-hamburger-bars" aria-hidden>
                <span className="nav-hamburger-bar" />
                <span className="nav-hamburger-bar" />
                <span className="nav-hamburger-bar" />
              </span>
            </button>
            <div
              className="nav-links-wrap"
              ref={linksWrapRef}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {NAV_ITEMS.map((item, i) => {
                if (item.hasMega) {
                  return (
                    <div
                      key={item.label}
                      className="nav-item-with-mega"
                      ref={catalogTriggerRef}
                      onMouseEnter={() => {
                        openMega()
                        setHoveredIndex(i)
                      }}
                      onMouseLeave={scheduleCloseMega}
                    >
                      <Link
                        href={toPath(item.href)}
                        className={`nav-link nav-link-btn ${catalogMegaOpen ? "nav-link--active" : ""}`}
                        aria-expanded={catalogMegaOpen}
                        aria-haspopup="true"
                      >
                        {item.label}
                      </Link>
                    </div>
                  )
                }
                return (
                  <span
                    key={item.label}
                    className="nav-link-wrap"
                    onMouseEnter={() => setHoveredIndex(i)}
                  >
                    <Link
                      href={toPath(item.href)}
                      className="nav-link"
                      onMouseEnter={() => setHoveredIndex(i)}
                    >
                      {item.label}
                    </Link>
                  </span>
                )
              })}
              <div
                className="nav-indicator"
                aria-hidden
                style={{
                  left: indicatorStyle.left,
                  width: activeIndex !== null ? indicatorStyle.width : 0,
                }}
              />
            </div>
          </div>

          <div className="nav-center">
            <Link href={toPath("/")} className="nav-logo">
              <Image src="/img/Logo.jpg" alt="Logo" width={100} height={100} />
            </Link>
          </div>

          <div className="nav-right">
            <button
              type="button"
              className="nav-icon nav-icon-search"
              aria-label="Buscar"
              onClick={openSearch}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </button>
            <Link href={toPath("/account")} className="nav-icon nav-icon-user" aria-label="Mi cuenta">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </Link>
            <div className="nav-locale-wrap">
              <div className="nav-lang-dropdown">
                <button
                  type="button"
                  className="nav-lang-trigger"
                  onClick={() => { setLangOpen((o) => !o); setCurrencyOpen(false) }}
                  aria-expanded={langOpen}
                  aria-haspopup="true"
                  aria-label="Idioma"
                >
                  <span>{locale === "es" ? "Es" : "English"}</span>
                  <svg className="nav-lang-chevron" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>
                {langOpen && (
                  <>
                    <div className="nav-lang-backdrop" aria-hidden onClick={() => setLangOpen(false)} />
                    <div className="nav-lang-panel" role="menu">
                      <button type="button" className={`nav-lang-option ${locale === "es" ? "nav-lang-option--active" : ""}`} onClick={() => { setLocale("es"); setLangOpen(false) }}>Español</button>
                      <button type="button" className={`nav-lang-option ${locale === "en" ? "nav-lang-option--active" : ""}`} onClick={() => { setLocale("en"); setLangOpen(false) }}>English</button>
                    </div>
                  </>
                )}
              </div>
              <div className="nav-currency-dropdown">
                <button
                  type="button"
                  className="nav-currency-trigger"
                  onClick={() => { setCurrencyOpen((o) => !o); setLangOpen(false) }}
                  aria-expanded={currencyOpen}
                  aria-haspopup="true"
                  aria-label="Moneda"
                >
                  <span className="nav-flag" aria-hidden>
                    {currency === "ARS" ? <FlagArgentina /> : <FlagUSA />}
                  </span>
                  <span>{currency === "ARS" ? "ARS $" : "USD $"}</span>
                  <svg className="nav-lang-chevron" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>
                {currencyOpen && (
                  <>
                    <div className="nav-lang-backdrop" aria-hidden onClick={() => setCurrencyOpen(false)} />
                    <div className="nav-lang-panel nav-currency-panel" role="menu">
                      <button type="button" className={`nav-lang-option ${currency === "ARS" ? "nav-lang-option--active" : ""}`} onClick={() => { setCurrency("ARS"); setCurrencyOpen(false) }}>
                        <span className="nav-flag" aria-hidden><FlagArgentina /></span> Argentina (ARS $)
                      </button>
                      <button type="button" className={`nav-lang-option ${currency === "USD" ? "nav-lang-option--active" : ""}`} onClick={() => { setCurrency("USD"); setCurrencyOpen(false) }}>
                        <span className="nav-flag" aria-hidden><FlagUSA /></span> USA (USD $)
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
            <button
              type="button"
              className="nav-icon nav-icon-cart"
              aria-label="Abrir carrito"
              onClick={openCart}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                <path d="M3 6h18" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              <span className="nav-cart-count" aria-hidden>{cartCount}</span>
            </button>
          </div>
        </div>
      </nav>

      <div
        className={`search-bar-strip ${searchOpen ? "search-bar-strip--open" : ""}`}
        role="search"
        ref={searchStripRef}
        aria-hidden={!searchOpen}
      >
        <form className="search-bar-strip__inner" onSubmit={handleSearchSubmit}>
          <svg className="search-bar-strip__icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            ref={searchInputRef}
            type="search"
            className="search-bar-strip__input"
            placeholder="Busca..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Buscar productos"
            autoComplete="off"
            tabIndex={searchOpen ? 0 : -1}
          />
          <button
            type="button"
            className="search-bar-strip__close"
            aria-label="Cerrar búsqueda"
            onClick={closeSearch}
            tabIndex={searchOpen ? 0 : -1}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </form>
      </div>

      {catalogMegaOpen && (
        <div
          className="catalog-dropdown"
          ref={megaRef}
          role="dialog"
          aria-label="Catálogo"
          onMouseEnter={openMega}
          onMouseLeave={closeMega}
        >
          <div className="catalog-dropdown__inner">
            <div className="catalog-dropdown__col">
              <ul className="catalog-dropdown__list">
                {MEGA_MAIN_LINKS.map((l) => (
                  <li key={l.label}>
                    <Link
href={toPath(l.href)}
                                      className={`catalog-dropdown__link ${l.highlight ? "catalog-dropdown__link--highlight" : ""}`}
                      onClick={closeMega}
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
                    <Link href={toPath(l.href)} className="catalog-dropdown__link" onClick={closeMega}>
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
                    <Link href={toPath(l.href)} className="catalog-dropdown__link" onClick={closeMega}>
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {mounted &&
        createPortal(
          <div
            id="nav-drawer-overlay"
            className={`nav-drawer-overlay ${menuOpen ? "is-open" : ""}`}
            aria-hidden={!menuOpen}
            onClick={(e) => e.target === e.currentTarget && closeMenu()}
          >
            <div id="nav-drawer" className="nav-drawer" role="dialog" aria-modal="true" aria-label="Menú">
              <div className="nav-drawer-header">
                <span className="nav-drawer-title">Menú</span>
                <button type="button" className="nav-drawer-close" aria-label="Cerrar menú" onClick={closeMenu}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="nav-drawer-links">
                {NAV_ITEMS.map((item) => (
                  <Link key={item.label} href={toPath(item.href)} className="nav-drawer-link" onClick={closeMenu}>
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>,
          document.body
        )}
    </header>
  )
}
