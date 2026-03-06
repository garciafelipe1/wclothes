"use client"

import { useEffect } from "react"
import { useLocaleCountry } from "@/app/context/locale-country"

/**
 * Sincroniza el atributo lang del documento con el locale de la URL.
 * Mejora accesibilidad y SEO al cambiar de idioma.
 */
export default function LocaleHtmlLang() {
  const { locale } = useLocaleCountry()

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = locale
    }
  }, [locale])

  return null
}
