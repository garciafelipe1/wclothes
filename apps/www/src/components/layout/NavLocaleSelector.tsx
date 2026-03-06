"use client"

import { useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useTranslations } from "next-intl"

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

type NavLocaleSelectorProps = {
  urlLocale: "es" | "en"
}

export default function NavLocaleSelector({ urlLocale }: NavLocaleSelectorProps) {
  const t = useTranslations("nav")
  const pathname = usePathname()
  const router = useRouter()
  const [langOpen, setLangOpen] = useState(false)
  const [currencyOpen, setCurrencyOpen] = useState(false)
  const [currency, setCurrency] = useState<"ARS" | "USD">("ARS")

  const switchLocale = (newLocale: "es" | "en") => {
    setLangOpen(false)
    if (newLocale === urlLocale) return
    const segments = pathname.split("/").filter(Boolean)
    if (segments.length >= 1) {
      segments[0] = newLocale
      router.push("/" + segments.join("/"))
    }
  }

  return (
    <div className="nav-locale-wrap">
      <div className="nav-lang-dropdown">
        <button
          type="button"
          className="nav-lang-trigger"
          onClick={() => { setLangOpen((o) => !o); setCurrencyOpen(false) }}
          aria-expanded={langOpen}
          aria-haspopup="true"
          aria-label={t("language")}
        >
          <span>{urlLocale === "es" ? "Es" : t("english")}</span>
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
                className={`nav-lang-option ${urlLocale === "es" ? "nav-lang-option--active" : ""}`}
                onClick={() => switchLocale("es")}
              >
                {t("spanish")}
              </button>
              <button
                type="button"
                className={`nav-lang-option ${urlLocale === "en" ? "nav-lang-option--active" : ""}`}
                onClick={() => switchLocale("en")}
              >
                {t("english")}
              </button>
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
          aria-label={t("currency")}
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
                <span className="nav-flag" aria-hidden><FlagArgentina /></span> Argentina (ARS $)
              </button>
              <button
                type="button"
                className={`nav-lang-option ${currency === "USD" ? "nav-lang-option--active" : ""}`}
                onClick={() => { setCurrency("USD"); setCurrencyOpen(false) }}
              >
                <span className="nav-flag" aria-hidden><FlagUSA /></span> USA (USD $)
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
