"use client"

import Link from "next/link"
import { useState } from "react"

const FOOTER_CATEGORIES = [
  { label: "Inicio", href: "/" },
  { label: "SUMMER SALE", href: "/catalog?filter=sale" },
  { label: "ULTIMOS INGRESOS", href: "/catalog?sort=newest" },
  { label: "TURNOS LOCAL", href: "/turnos" },
  { label: "Indumentaria", href: "/catalog?category=ropa" },
  { label: "Zapatillas", href: "/catalog?category=zapatillas" },
  { label: "Marcas", href: "/catalog?filter=brands" },
  { label: "Devoluciónes", href: "/devoluciones" },
]

export default function Footer() {
  const [email, setEmail] = useState("")
  const [country, setCountry] = useState("Argentina")

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: conectar con tu servicio de newsletter
    console.log("Newsletter:", email)
  }

  return (
    <footer className="site-footer">
      <div className="footer-inner">
        {/* Tres columnas: Newsletter + Categorías + Contacto */}
        <div className="footer-top">
          <div className="footer-col footer-newsletter">
            <h3 className="footer-heading">SUSCRIBITE A NUESTRO NEWSLETTER</h3>
            <form onSubmit={handleNewsletterSubmit} className="footer-newsletter-form">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="footer-newsletter-input"
                aria-label="Email para newsletter"
              />
              <button type="submit" className="footer-newsletter-btn" aria-label="Enviar">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            </form>
            <div className="footer-social">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="footer-social-link" aria-label="Instagram">
                <InstagramIcon />
              </a>
              <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" className="footer-social-link" aria-label="TikTok">
                <TikTokIcon />
              </a>
            </div>
          </div>

          <div className="footer-col footer-categories">
            <h3 className="footer-heading">CATEGORIAS</h3>
            <ul className="footer-links">
              {FOOTER_CATEGORIES.map((item) => (
                <li key={item.href}>
                  <Link href={item.href}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer-col footer-contact">
            <h3 className="footer-heading">CONTACTANOS</h3>
            <ul className="footer-contact-list">
              <li>@CLOTHERBROS</li>
              <li><a href="mailto:clproda@gmail.com">clproda@gmail.com</a></li>
              <li>Ituzaingo, Villa Udaondo (Buenos Aires)</li>
            </ul>
          </div>
        </div>

        {/* Medios de pago + país */}
        <div className="footer-mid">
          <div className="footer-payment-icons">
            <VisaIcon />
            <MastercardIcon />
            <AmexIcon />
            <span className="footer-payment-other">Otros</span>
          </div>
          <div className="footer-country-wrap">
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="footer-country-select"
              aria-label="País"
            >
              <option value="Argentina">Argentina</option>
              <option value="Uruguay">Uruguay</option>
            </select>
          </div>
        </div>

        {/* Copyright y legal */}
        <div className="footer-bottom">
          <p className="footer-copyright">
            Copyright Clotherbros - 20452881137 - 2026. Todos los derechos reservados.
          </p>
          <p className="footer-legal">
            Defensa de las y los consumidores. Para reclamos ingresá acá. / Botón de arrepentimiento
          </p>
        </div>
      </div>
    </footer>
  )
}

function InstagramIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="18" cy="6" r="1.5" fill="currentColor" />
    </svg>
  )
}

function TikTokIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
    </svg>
  )
}

function VisaIcon() {
  return (
    <span className="footer-payment-icon footer-payment-visa" title="Visa">
      <svg viewBox="0 0 40 16" width="40" height="16" aria-hidden>
        <rect width="40" height="16" rx="2" fill="#1A1F71" />
        <text x="20" y="11" fill="#fff" fontSize="8" fontWeight="700" fontFamily="sans-serif" textAnchor="middle">VISA</text>
      </svg>
    </span>
  )
}

function MastercardIcon() {
  return (
    <span className="footer-payment-icon footer-payment-mastercard" title="Mastercard">
      <svg viewBox="0 0 24 16" width="24" height="16" aria-hidden>
        <circle cx="9" cy="8" r="6" fill="#EB001B" />
        <circle cx="15" cy="8" r="6" fill="#F79E1B" />
        <path fill="#FF5F00" d="M12 3.2a6 6 0 0 1 0 9.6 6.5 6.5 0 0 0 0-9.6z" />
      </svg>
    </span>
  )
}

function AmexIcon() {
  return (
    <span className="footer-payment-icon footer-payment-amex" title="American Express">
      <svg viewBox="0 0 48 16" width="48" height="16" fill="none" aria-hidden>
        <rect width="48" height="16" rx="2" fill="#006FCF" />
        <text x="24" y="11" fill="#fff" fontSize="7" fontWeight="700" fontFamily="sans-serif" textAnchor="middle">AMEX</text>
      </svg>
    </span>
  )
}
