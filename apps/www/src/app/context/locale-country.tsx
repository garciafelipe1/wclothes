"use client"

import { createContext, useContext, useMemo } from "react"
import type { Locale } from "@/i18n/routing"
import type { CountryCode } from "@/i18n/routing"

type LocaleCountry = {
  locale: Locale
  countryCode: CountryCode
}

const LocaleCountryContext = createContext<LocaleCountry | null>(null)

export function LocaleCountryProvider({
  locale,
  countryCode,
  children,
}: {
  locale: string
  countryCode: string
  children: React.ReactNode
}) {
  const value = useMemo(
    () => ({ locale: locale as Locale, countryCode: countryCode as CountryCode }),
    [locale, countryCode]
  )
  return (
    <LocaleCountryContext.Provider value={value}>
      {children}
    </LocaleCountryContext.Provider>
  )
}

export function useLocaleCountry(): LocaleCountry {
  const ctx = useContext(LocaleCountryContext)
  if (!ctx) throw new Error("useLocaleCountry must be used within LocaleCountryProvider")
  return ctx
}

export { getLocalizedPath } from "@/i18n/routing"
