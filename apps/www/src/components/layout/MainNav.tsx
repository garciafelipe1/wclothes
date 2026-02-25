"use client"

import Link from "next/link"
import Image from "next/image"
import { useState, useEffect, useCallback } from "react"
import { createPortal } from "react-dom"

type NavLink = {
  label: string
  href: string
}

/* Banderas solo para selector de moneda (ARS / USD) */
function FlagArgentina({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 14" width="20" height="14" role="img" aria-label="Argentina" preserveAspectRatio="xMidYMid slice">
      <rect width="20" height="14" fill="#75AADB" />
      <rect y="4.67" width="20" height="4.67" fill="#fff" />
      <circle cx="10" cy="7" r="2.2" fill="#F4D03F" />
      <g stroke="#F4D03F" strokeWidth="0.4" strokeLinecap="round">
        {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
          const r = (deg * Math.PI) / 180
          const x1 = 10 + 1.4 * Math.cos(r)
          const y1 = 7 + 1.4 * Math.sin(r)
          const x2 = 10 + 2.2 * Math.cos(r)
          const y2 = 7 + 2.2 * Math.sin(r)
          return <line key={deg} x1={x1} y1={y1} x2={x2} y2={y2} />
        })}
      </g>
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
      <circle cx="4" cy="3.5" r="0.8" fill="#fff" />
      <circle cx="4" cy="7" r="0.8" fill="#fff" />
      <circle cx="4" cy="10.5" r="0.8" fill="#fff" />
    </svg>
  )
}

const NAV_ITEMS: NavLink[] = [
  { label: "NUEVOS INGRESOS", href: "/catalog?new=1" },
  { label: "COLECCIONES EXCLUSIVAS", href: "/catalog?filter=colecciones-exclusivas" },
  { label: "CATÁLOGO", href: "/catalog" },
]

const NAV_LINKS = NAV_ITEMS

export default function MainNav(): JSX.Element {
  const [menuOpen, setMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [langOpen, setLangOpen] = useState(false)
  const [currencyOpen, setCurrencyOpen] = useState(false)
  const [locale, setLocale] = useState<"es" | "en">("es")
  const [currency, setCurrency] = useState<"ARS" | "USD">("ARS")

  const closeMenu = useCallback(() => setMenuOpen(false), [])

  useEffect(() => {
    setMounted(true)
    const savedLocale = localStorage.getItem("locale") as "es" | "en" | null
    const savedCurrency = localStorage.getItem("currency") as "ARS" | "USD" | null
    if (savedLocale === "es" || savedLocale === "en") setLocale(savedLocale)
    if (savedCurrency === "ARS" || savedCurrency === "USD") setCurrency(savedCurrency)
  }, [])

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = locale
    }
    if (mounted) {
      localStorage.setItem("locale", locale)
      localStorage.setItem("currency", currency)
    }
  }, [locale, currency, mounted])

  useEffect(() => {
    if (!menuOpen) return
    const onEscape = (e: KeyboardEvent) => e.key === "Escape" && closeMenu()
    document.addEventListener("keydown", onEscape)
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", onEscape)
      document.body.style.overflow = ""
    }
  }, [menuOpen, closeMenu])

  return (
    <header className="main-header">
      

      <nav className="main-nav" aria-label="Principal">
        {/* Zona única: todo el nav + panel. Al salir se cierra el mega-menú */}
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
            <div className="nav-links-wrap">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="nav-link"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="nav-center">
            <Link href="/" className="nav-logo">
              <Image src="/img/Logo.jpg" alt="Logo" width={100} height={100} />
            </Link>
          </div>

          <div className="nav-right">
            <Link href="/search" className="nav-icon nav-icon-search" aria-label="Buscar">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </Link>
            <Link href="/account" className="nav-icon nav-icon-user" aria-label="Mi cuenta">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </Link>
            <div className="nav-locale-wrap">
              {/* Idioma: solo texto, sin bandera */}
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
                      <button
                        type="button"
                        className={`nav-lang-option ${locale === "es" ? "nav-lang-option--active" : ""}`}
                        onClick={() => { setLocale("es"); setLangOpen(false) }}
                      >
                        Español
                      </button>
                      <button
                        type="button"
                        className={`nav-lang-option ${locale === "en" ? "nav-lang-option--active" : ""}`}
                        onClick={() => { setLocale("en"); setLangOpen(false) }}
                      >
                        English
                      </button>
                    </div>
                  </>
                )}
              </div>
              {/* Moneda: con bandera (ARS / USD) */}
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
                      <button
                        type="button"
                        className={`nav-lang-option ${currency === "ARS" ? "nav-lang-option--active" : ""}`}
                        onClick={() => { setCurrency("ARS"); setCurrencyOpen(false) }}
                      >
                        <span className="nav-flag" aria-hidden><FlagArgentina /></span>
                        Argentina (ARS $)
                      </button>
                      <button
                        type="button"
                        className={`nav-lang-option ${currency === "USD" ? "nav-lang-option--active" : ""}`}
                        onClick={() => { setCurrency("USD"); setCurrencyOpen(false) }}
                      >
                        <span className="nav-flag" aria-hidden><FlagUSA /></span>
                        USA (USD $)
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
            <Link href="/cart" className="nav-icon" aria-label="Carrito">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                <path d="M3 6h18" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
            </Link>
          </div>
        </div>
      </nav>

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
                {NAV_LINKS.map((item) => (
                  <Link key={item.label} href={item.href} className="nav-drawer-link" onClick={closeMenu}>
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
