import { createNavigation } from "next-intl/navigation"
import { defineRouting } from "next-intl/routing"

export const routing = defineRouting({
  locales: ["es", "en"],
  defaultLocale: "es",
  pathnames: {},
})

export type Locale = (typeof routing.locales)[number]

/** Países/regiones soportados para compra (iso_2) */
export const COUNTRIES = ["ar", "us"] as const
export type CountryCode = (typeof COUNTRIES)[number]

export const defaultCountryByLocale: Record<Locale, CountryCode> = {
  es: "ar",
  en: "us",
}

export const {
  Link: IntlLink,
  redirect: intlRedirect,
  usePathname: useIntlPathname,
  useRouter: useIntlRouter,
  getPathname: getIntlPathname,
} = createNavigation(routing)

/** Path con prefijo /locale/countryCode (para uso en server o client) */
export function getLocalizedPath(locale: string, countryCode: string, path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`
  return `/${locale}/${countryCode}${p === "/" ? "" : p}`
}
