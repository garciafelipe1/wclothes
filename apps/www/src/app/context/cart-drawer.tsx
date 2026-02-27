"use client"

import { createContext, useContext, useState, useCallback, useEffect } from "react"
import { CartDrawer } from "@/components/cart/CartDrawer"

type CartDrawerContextValue = {
  isOpen: boolean
  openCart: () => void
  closeCart: () => void
  cartCount: number
  setCartCount: (n: number) => void
  incrementCartCount: () => void
}

const CartDrawerContext = createContext<CartDrawerContextValue | null>(null)

type CartDrawerProviderProps = {
  children: React.ReactNode
  initialCartCount?: number
}

export function CartDrawerProvider({ children, initialCartCount = 0 }: CartDrawerProviderProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [cartCount, setCartCount] = useState(initialCartCount)
  const openCart = useCallback(() => setIsOpen(true), [])
  const closeCart = useCallback(() => setIsOpen(false), [])
  const incrementCartCount = useCallback(() => setCartCount((c) => c + 1), [])

  useEffect(() => {
    setCartCount(initialCartCount)
  }, [initialCartCount])

  return (
    <CartDrawerContext.Provider
      value={{ isOpen, openCart, closeCart, cartCount, setCartCount, incrementCartCount }}
    >
      {children}
      <CartDrawer isOpen={isOpen} onClose={closeCart} />
    </CartDrawerContext.Provider>
  )
}

export function useCartDrawer(): CartDrawerContextValue {
  const ctx = useContext(CartDrawerContext)
  if (!ctx) throw new Error("useCartDrawer must be used within CartDrawerProvider")
  return ctx
}
