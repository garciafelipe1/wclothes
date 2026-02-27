"use client"

import { useCartDrawer } from "@/app/context/cart-drawer"

type OpenCartLinkProps = {
  className?: string
  children: React.ReactNode
}

/**
 * Botón/enlace que abre el slider del carrito (para usar en lugar de un link a /checkout/cart).
 */
export function OpenCartLink({ className, children }: OpenCartLinkProps) {
  const { openCart } = useCartDrawer()
  return (
    <button
      type="button"
      onClick={openCart}
      className={className}
    >
      {children}
    </button>
  )
}
