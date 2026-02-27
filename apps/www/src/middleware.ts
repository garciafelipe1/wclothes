import createIntlMiddleware from "next-intl/middleware"
import { NextRequest, NextResponse } from "next/server"
import { routing } from "./i18n/routing"

const intlMiddleware = createIntlMiddleware(routing)

const DEFAULT_COUNTRY = process.env.NEXT_PUBLIC_DEFAULT_COUNTRY || "ar"
const COUNTRIES = ["ar", "us"]

function getCountryFromPath(pathname: string): string | null {
  const segments = pathname.split("/").filter(Boolean)
  if (segments.length >= 2 && COUNTRIES.includes(segments[1])) return segments[1]
  return null
}

function getLocaleFromPath(pathname: string): string | null {
  const segments = pathname.split("/").filter(Boolean)
  if (segments.length >= 1 && routing.locales.includes(segments[0] as "es" | "en")) return segments[0]
  return null
}

export default function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  if (pathname.startsWith("/api") || pathname.startsWith("/_next") || pathname.includes(".")) {
    return NextResponse.next()
  }

  const locale = getLocaleFromPath(pathname)
  const country = getCountryFromPath(pathname)

  if (!locale) {
    const defaultLocale = routing.defaultLocale
    const defaultCountry = defaultLocale === "en" ? "us" : DEFAULT_COUNTRY
    const newPath = `/${defaultLocale}/${defaultCountry}${pathname === "/" ? "" : pathname}`
    return NextResponse.redirect(new URL(newPath, request.url), 307)
  }

  if (!country) {
    const defaultCountry = locale === "en" ? "us" : DEFAULT_COUNTRY
    const rest = pathname === `/${locale}` ? "" : pathname.slice(locale.length + 1)
    const newPath = `/${locale}/${defaultCountry}${rest}`
    return NextResponse.redirect(new URL(newPath, request.url), 307)
  }

  return intlMiddleware(request)
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
}
