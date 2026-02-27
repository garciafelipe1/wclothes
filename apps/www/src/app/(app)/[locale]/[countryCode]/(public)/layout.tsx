import { COUNTRIES } from "@/i18n/routing"
import type { CountryCode } from "@/i18n/routing"
import { notFound } from "next/navigation"
import MainNav from "@/components/layout/MainNav"
import Footer from "@/components/layout/Footer"
import { LocaleCountryProvider } from "@/app/context/locale-country"
import { CartDrawerProvider } from "@/app/context/cart-drawer"
import { getCartCount } from "@/services/cart.service"

export function generateStaticParams() {
  const locales = ["es", "en"]
  const params: { locale: string; countryCode: string }[] = []
  for (const locale of locales) {
    for (const countryCode of COUNTRIES) {
      params.push({ locale, countryCode })
    }
  }
  return params
}

export default async function PublicLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode
  params: Promise<{ locale: string; countryCode: string }>
}>) {
  const { locale, countryCode } = await params
  if (!COUNTRIES.includes(countryCode as CountryCode)) notFound()

  const cartCount = await getCartCount()

  return (
    <LocaleCountryProvider locale={locale} countryCode={countryCode}>
      <CartDrawerProvider initialCartCount={cartCount}>
        <MainNav />
        <main>{children}</main>
        <Footer />
      </CartDrawerProvider>
    </LocaleCountryProvider>
  )
}
