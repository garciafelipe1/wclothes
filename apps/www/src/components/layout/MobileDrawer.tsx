"use client"

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import Link from "next/link"
import { useTranslations } from "next-intl"

type NavItem = {
  label: string
  href: string
}

type MobileDrawerProps = {
  open: boolean
  onClose: () => void
  items: NavItem[]
  toPath: (path: string) => string
}

export default function MobileDrawer({ open, onClose, items, toPath }: MobileDrawerProps) {
  const t = useTranslations("nav")
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (!open) return
    const onEscape = (e: KeyboardEvent) => e.key === "Escape" && onClose()
    document.body.style.overflow = "hidden"
    document.addEventListener("keydown", onEscape)
    return () => {
      document.removeEventListener("keydown", onEscape)
      document.body.style.overflow = ""
    }
  }, [open, onClose])

  if (!mounted) return null

  return createPortal(
    <div
      id="nav-drawer-overlay"
      className={`nav-drawer-overlay ${open ? "is-open" : ""}`}
      aria-hidden={!open}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div id="nav-drawer" className="nav-drawer" role="dialog" aria-modal="true" aria-label="Menú">
        <div className="nav-drawer-header">
          <span className="nav-drawer-title">{t("menu")}</span>
          <button type="button" className="nav-drawer-close" aria-label={t("closeMenu")} onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="nav-drawer-links">
          {items.map((item) => (
            <Link key={item.label} href={toPath(item.href)} className="nav-drawer-link" onClick={onClose}>
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </div>,
    document.body
  )
}
