"use client"

import Link from "next/link"
import { useEffect, useState } from "react"

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1920&q=80"

export default function HeroParallax() {
  const [offsetY, setOffsetY] = useState(0)

  useEffect(() => {
    const handleScroll = () => setOffsetY(window.scrollY)
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <section className="hero-parallax">
      <div
        className="hero-parallax__bg"
        style={{
          transform: `translate3d(0, ${offsetY * 0.35}px, 0)`,
        }}
      />
      <div className="hero-parallax__overlay" />
      <div className="hero-parallax__content">
        <h1 className="hero-parallax__title">Spring &apos;24 Collection</h1>
        <p className="hero-parallax__desc">
          La última colección con prendas exclusivas y tonos en gradiente.
          Envío gratis en pedidos seleccionados.
        </p>
        <Link href="/catalog" className="hero-parallax__cta">
          VER COLECCIÓN
        </Link>
      </div>
    </section>
  )
}
