import type { Metadata } from "next"
import { Montserrat } from "next/font/google"
import "./globals.css"
import MainNav from "@/components/layout/MainNav"
import Footer from "@/components/layout/Footer"

const montserrat = Montserrat({
  subsets: ["latin", "latin-ext"],
  variable: "--font-nav",
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
    <html lang="es" className={montserrat.variable}>
      <body>
        <MainNav />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}
