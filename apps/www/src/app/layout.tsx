import type { Metadata } from "next"
import { Montserrat, Great_Vibes } from "next/font/google"
import "./globals.css"

const montserrat = Montserrat({
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-nav",
  display: "swap",
})

const greatVibes = Great_Vibes({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-logo-script",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Ecommerce | Tienda de ropa",
  description: "Tienda con Medusa",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className={`${montserrat.variable} ${greatVibes.variable}`}>
      <body>{children}</body>
    </html>
  )
}
