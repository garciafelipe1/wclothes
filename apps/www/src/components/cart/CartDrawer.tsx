"use client"

import { useEffect, useState, useCallback } from "react"
import { createPortal } from "react-dom"
import Link from "next/link"
import { useLocaleCountry, getLocalizedPath } from "@/app/context/locale-country"
import { useCartDrawer } from "@/app/context/cart-drawer"
import { getCartForDrawerAction } from "@/app/actions/cart/get-cart-for-drawer"
import { CartItemRow } from "@/components/cart/CartItemRow"
import { formatPrice } from "@/lib/format"

type CartDrawerProps = {
  isOpen: boolean
  onClose: () => void
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { locale, countryCode } = useLocaleCountry()
  const { setCartCount } = useCartDrawer()
  const [cart, setCart] = useState<Awaited<ReturnType<typeof getCartForDrawerAction>> | null>(null)
  const [loading, setLoading] = useState(false)
  const catalogPath = getLocalizedPath(locale, countryCode, "/catalog")

  const loadCart = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getCartForDrawerAction()
      setCart(data)
      setCartCount(data.items?.length ?? 0)
    } catch {
      setCart({ items: [], currencyCode: "ars", subtotal: 0, hasItems: false })
      setCartCount(0)
    } finally {
      setLoading(false)
    }
  }, [setCartCount])

  useEffect(() => {
    if (isOpen) {
      loadCart()
      document.body.style.overflow = "hidden"
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [isOpen, loadCart])

  useEffect(() => {
    if (!isOpen) return
    const onEscape = (e: KeyboardEvent) => e.key === "Escape" && onClose()
    document.addEventListener("keydown", onEscape)
    return () => document.removeEventListener("keydown", onEscape)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const content = (
    <>
      <div
        className="cart-drawer-overlay"
        aria-hidden
        onClick={onClose}
      />
      <div
        className="cart-drawer-panel"
        role="dialog"
        aria-modal="true"
        aria-label="Carrito"
      >
        <div className="cart-drawer-header">
          <h2 className="cart-drawer-title">Items</h2>
          <button
            type="button"
            className="cart-drawer-close"
            onClick={onClose}
            aria-label="Cerrar carrito"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="cart-drawer-body">
          {loading ? (
            <p className="cart-drawer-empty">Cargando carrito...</p>
          ) : !cart?.hasItems ? (
            <p className="cart-drawer-empty">Tu carrito está vacío.</p>
          ) : (
            <div className="cart-drawer-items">
              {cart.items.map((item) => (
                <CartItemRow
                  key={item.id}
                  item={item}
                  locale={locale}
                  countryCode={countryCode}
                  catalogPath={catalogPath}
                  currencyCode={cart.currencyCode}
                  onQuantityUpdated={loadCart}
                  onRemoved={loadCart}
                />
              ))}
            </div>
          )}
        </div>

        {cart?.hasItems && (
          <div className="cart-drawer-footer">
            <div className="cart-drawer-summary">
              <div className="cart-drawer-summary-row">
                <span>Envío</span>
                <span className="cart-drawer-summary-note">Se calcula en el siguiente paso</span>
              </div>
              <div className="cart-drawer-summary-row cart-drawer-subtotal">
                <span>Subtotal</span>
                <span>{formatPrice(cart.subtotal, cart.currencyCode)}</span>
              </div>
            </div>
            <Link
              href={getLocalizedPath(locale, countryCode, "/checkout/address")}
              className="cart-drawer-checkout-btn"
              onClick={onClose}
            >
              IR AL CHECKOUT
            </Link>
            <p className="cart-drawer-payment-label">Métodos de pago aceptados</p>
            <div className="cart-drawer-payment-logos">
              <span>Visa</span>
              <span>Mastercard</span>
              <span>American Express</span>
              <span>PayPal</span>
              <span>Apple Pay</span>
            </div>
          </div>
        )}
      </div>
    </>
  )

  return createPortal(content, document.body)
}
