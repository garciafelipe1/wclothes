"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"

type NavSearchBarProps = {
  searchOpen: boolean
  onClose: () => void
  toPath: (path: string) => string
}

export default function NavSearchBar({ searchOpen, onClose, toPath }: NavSearchBarProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const searchInputRef = useRef<HTMLInputElement>(null)
  const searchStripRef = useRef<HTMLDivElement>(null)

  const closeSearch = useCallback(() => {
    setSearchQuery("")
    onClose()
  }, [onClose])

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

  useEffect(() => {
    if (!searchOpen) return
    const onEscape = (e: KeyboardEvent) => e.key === "Escape" && closeSearch()
    document.addEventListener("keydown", onEscape)
    return () => document.removeEventListener("keydown", onEscape)
  }, [searchOpen, closeSearch])

  return (
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
  )
}
