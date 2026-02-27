"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { updateCartItemQuantityAction } from "@/app/actions/cart/update-cart-item"
import { removeFromCartAction } from "@/app/actions/cart/remove-from-cart"
import { getLocalizedPath } from "@/i18n/routing"
import { formatPrice } from "@/lib/format"

export type CartItemRowProps = {
  item: {
    id: string
    title?: string
    quantity?: number
    thumbnail?: string | null
    unit_price?: number
    total?: number
    product_handle?: string
    variant_title?: string | null
    variant_option_values?: Record<string, unknown>
  }
  locale: string
  countryCode: string
  catalogPath: string
  currencyCode: string
  onQuantityUpdated?: () => void
  onRemoved?: () => void
  showRemove?: boolean
}

export function CartItemRow({
  item,
  locale,
  countryCode,
  catalogPath,
  currencyCode,
  onQuantityUpdated,
  onRemoved,
  showRemove = true,
}: CartItemRowProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const quantity = item.quantity ?? 1
  const productPath = item.product_handle
    ? getLocalizedPath(locale, countryCode, `/catalog/${item.product_handle}`)
    : catalogPath

  const opts = item.variant_option_values
  const sizeLabel =
    item.variant_title ??
    (opts != null &&
    typeof opts === "object" &&
    !Array.isArray(opts) &&
    Object.keys(opts).length > 0
      ? String(Object.values(opts)[0] ?? "")
      : null)

  async function handleQuantityChange(delta: number) {
    const newQty = Math.max(1, quantity + delta)
    if (newQty === quantity) return
    setLoading(true)
    try {
      const result = await updateCartItemQuantityAction(item.id, newQty)
      if (result.success) {
        onQuantityUpdated?.()
        router.refresh()
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleRemove() {
    setLoading(true)
    try {
      const result = await removeFromCartAction(item.id)
      if (result.success) {
        onRemoved?.()
        router.refresh()
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex gap-4 py-4 border-b border-neutral-200 last:border-0 relative">
      <Link
        href={productPath}
        className="shrink-0 w-20 h-24 sm:w-24 sm:h-28 relative rounded overflow-hidden bg-neutral-100 block"
      >
        {item.thumbnail ? (
          <img
            src={item.thumbnail}
            alt={item.title ?? ""}
            className="h-full w-full object-cover"
            width={96}
            height={112}
          />
        ) : (
          <span className="absolute inset-0 flex items-center justify-center text-neutral-400 text-xs">
            —
          </span>
        )}
      </Link>

      <div className="min-w-0 flex-1 flex flex-col">
        <Link
          href={productPath}
          className="font-medium text-neutral-900 hover:underline"
        >
          {item.title ?? "Producto"}
        </Link>
        <p className="text-sm text-neutral-600 mt-0.5">
          {formatPrice(item.unit_price ?? 0, currencyCode)}
        </p>

        <div className="mt-2 flex flex-wrap items-center gap-3">
          <div className="flex items-center border border-neutral-300 rounded">
            <button
              type="button"
              aria-label="Reducir cantidad"
              disabled={loading || quantity <= 1}
              onClick={() => handleQuantityChange(-1)}
              className="w-9 h-9 flex items-center justify-center text-neutral-600 hover:bg-neutral-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              −
            </button>
            <span className="w-8 text-center text-sm tabular-nums" aria-live="polite">
              {quantity}
            </span>
            <button
              type="button"
              aria-label="Aumentar cantidad"
              disabled={loading}
              onClick={() => handleQuantityChange(1)}
              className="w-9 h-9 flex items-center justify-center text-neutral-600 hover:bg-neutral-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              +
            </button>
          </div>

          {sizeLabel && (
            <div className="flex items-center gap-1">
              <span className="text-sm text-neutral-500">Talle:</span>
              <span className="text-sm font-medium">{sizeLabel}</span>
              <Link
                href={productPath}
                className="text-xs text-neutral-500 hover:underline ml-1"
              >
                Cambiar
              </Link>
            </div>
          )}
        </div>
      </div>

      {showRemove && (
        <button
          type="button"
          aria-label="Quitar del carrito"
          disabled={loading}
          onClick={handleRemove}
          className="absolute top-4 right-0 w-8 h-8 flex items-center justify-center text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded disabled:opacity-50"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14Z" />
            <path d="M10 11v6M14 11v6" />
          </svg>
        </button>
      )}
    </div>
  )
}
