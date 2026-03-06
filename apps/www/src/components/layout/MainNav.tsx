"use client"

import Link from "next/link"
import Image from "next/image"
import { useState, useCallback, useRef } from "react"
import { useTranslations } from "next-intl"
import { useLocaleCountry } from "@/app/context/locale-country"
import { useCartDrawer } from "@/app/context/cart-drawer"
import { getLocalizedPath } from "@/i18n/routing"
import { useNavIndicator } from "./useNavIndicator"
import NavSearchBar from "./NavSearchBar"
import NavLocaleSelector from "./NavLocaleSelector"
import CatalogMegaMenu from "./CatalogMegaMenu"
import MobileDrawer from "./MobileDrawer"

type NavItem = {
  labelKey: string
  href: string
  hasMega?: boolean
}

const NAV_ITEMS: NavItem[] = [
  { labelKey: "newArrivals", href: "/catalog?new=1" },
  { labelKey: "exclusiveCollections", href: "/catalog?filter=colecciones-exclusivas" },
  { labelKey: "catalog", href: "/catalog", hasMega: true },
]

export default function MainNav(): JSX.Element {
  const t = useTranslations("nav")
  const { locale: urlLocale, countryCode } = useLocaleCountry()
  const { openCart, cartCount } = useCartDrawer()
  const [menuOpen, setMenuOpen] = useState(false)
  const [catalogMegaOpen, setCatalogMegaOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const catalogCloseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const toPath = useCallback(
    (path: string) => getLocalizedPath(urlLocale, countryCode, path),
    [urlLocale, countryCode]
  )

  const { linksWrapRef, setHoveredIndex, activeIndex, indicatorStyle } = useNavIndicator(catalogMegaOpen)

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

  const closeMega = useCallback(() => setCatalogMegaOpen(false), [])

  return (
    <header className="main-header">
      <nav className="main-nav" aria-label="Principal">
        <div className="nav-bar-wrap">
          <div className="nav-left">
            <button
              type="button"
              className="nav-hamburger"
              aria-label={t("openMenu")}
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
                      key={item.labelKey}
                      className="nav-item-with-mega"
                      onMouseEnter={() => { openMega(); setHoveredIndex(i) }}
                      onMouseLeave={scheduleCloseMega}
                    >
                      <Link
                        href={toPath(item.href)}
                        className={`nav-link nav-link-btn ${catalogMegaOpen ? "nav-link--active" : ""}`}
                        aria-expanded={catalogMegaOpen}
                        aria-haspopup="true"
                      >
                        {t(item.labelKey)}
                      </Link>
                    </div>
                  )
                }
                return (
                  <span
                    key={item.labelKey}
                    className="nav-link-wrap"
                    onMouseEnter={() => setHoveredIndex(i)}
                  >
                    <Link
                      href={toPath(item.href)}
                      className="nav-link"
                      onMouseEnter={() => setHoveredIndex(i)}
                    >
                      {t(item.labelKey)}
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
              aria-label={t("search")}
              onClick={() => setSearchOpen(true)}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </button>
            <Link href={toPath("/account")} className="nav-icon nav-icon-user" aria-label={t("account")}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </Link>
            <NavLocaleSelector urlLocale={urlLocale} />
            <button
              type="button"
              className="nav-icon nav-icon-cart"
              aria-label={t("openCart")}
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

      <NavSearchBar
        searchOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        toPath={toPath}
      />

      <CatalogMegaMenu
        open={catalogMegaOpen}
        onOpen={openMega}
        onClose={closeMega}
        toPath={toPath}
      />

      <MobileDrawer
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        items={NAV_ITEMS.map((i) => ({ label: t(i.labelKey), href: i.href }))}
        toPath={toPath}
      />
    </header>
  )
}
