"use client"

import { useEffect, useRef, useState } from "react"

type ParallaxSectionProps = {
  image: string
  title: string
  description?: string
  ctaText?: string
  ctaHref?: string
}

export default function ParallaxSection({
  image,
  title,
  description,
  ctaText,
  ctaHref = "/catalog",
}: ParallaxSectionProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const [translateY, setTranslateY] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return
      const rect = sectionRef.current.getBoundingClientRect()
      const sectionTop = rect.top + window.scrollY
      const scrollProgress = window.scrollY - sectionTop
      setTranslateY(scrollProgress * 0.4)
    }
    handleScroll()
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <section ref={sectionRef} className="hero-parallax">
      <div
        className="hero-parallax__bg"
        style={{
          backgroundImage: `url(${image})`,
          transform: `translate3d(0, ${translateY}px, 0)`,
        }}
      />
      <div className="hero-parallax__overlay" />
      <div className="hero-parallax__content">
        <h2 className="hero-parallax__title">{title}</h2>
        {description && (
          <p className="hero-parallax__desc">{description}</p>
        )}
        {ctaText && (
          <a href={ctaHref} className="hero-parallax__cta">
            {ctaText}
          </a>
        )}
      </div>
    </section>
  )
}
