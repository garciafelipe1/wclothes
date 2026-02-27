"use client"

import Link from "next/link"
import { useLocaleCountry, getLocalizedPath } from "@/app/context/locale-country"

export function LocalizedLink({
  href,
  children,
  ...props
}: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; children: React.ReactNode }) {
  const { locale, countryCode } = useLocaleCountry()
  const path = getLocalizedPath(locale, countryCode, href)
  return (
    <Link href={path} {...props}>
      {children}
    </Link>
  )
}
