"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { addToCartAction } from "@/app/actions/cart/add-to-cart"
import { useCartDrawer } from "@/app/context/cart-drawer"

type AddToCartButtonProps = {
  variantId: string
  countryCode: string
  locale: string
  disabled?: boolean
}

export function AddToCartButton({
  variantId,
  countryCode,
  locale,
  disabled = false,
}: AddToCartButtonProps) {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const router = useRouter()
  const { openCart, incrementCartCount } = useCartDrawer()

  async function handleAdd() {
    setMessage(null)
    setLoading(true)
    try {
      const result = await addToCartAction({
        variantId,
        quantity: 1,
        countryCode,
      })
      if (result.success) {
        setMessage({ type: "success", text: "Agregado al carrito" })
        incrementCartCount()
        openCart()
        router.refresh()
      } else {
        setMessage({ type: "error", text: result.error ?? "Error al agregar" })
      }
    } catch (e) {
      setMessage({
        type: "error",
        text: e instanceof Error ? e.message : "Error al agregar",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={handleAdd}
        disabled={disabled || loading}
        className="w-full sm:w-auto px-6 py-3 bg-black text-white font-medium rounded hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? "Agregando..." : "Agregar al carrito"}
      </button>
      {message && (
        <p
          className={`text-sm ${message.type === "success" ? "text-green-700" : "text-red-600"}`}
          role="status"
        >
          {message.text}
        </p>
      )}
    </div>
  )
}
