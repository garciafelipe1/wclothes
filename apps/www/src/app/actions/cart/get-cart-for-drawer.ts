"use server"

import { getCartId } from "@/lib/data/cookies"
import { getCartWithItems } from "@/services/cart.service"

/**
 * Devuelve los datos del carrito para el drawer (serializable).
 */
export async function getCartForDrawerAction(): Promise<{
  items: Array<{
    id: string
    title?: string
    quantity?: number
    thumbnail?: string | null
    unit_price?: number
    total?: number
    product_handle?: string
    variant_title?: string | null
    variant_option_values?: Record<string, unknown>
  }>
  currencyCode: string
  subtotal: number
  hasItems: boolean
}> {
  const cartId = await getCartId()
  const cart = await getCartWithItems(cartId)
  const items = cart?.items ?? []
  const hasItems = Array.isArray(items) && items.length > 0
  const currencyCode = cart?.currency_code ?? "ars"
  const subtotal = cart?.subtotal ?? cart?.item_subtotal ?? cart?.total ?? 0

  return {
    items: hasItems
      ? items.map(
          (item: {
            id: string
            title?: string
            quantity?: number
            thumbnail?: string | null
            unit_price?: number
            total?: number
            product_handle?: string
            variant_title?: string | null
            variant_option_values?: Record<string, unknown>
          }) => ({
            id: item.id,
            title: item.title,
            quantity: item.quantity,
            thumbnail: item.thumbnail,
            unit_price: item.unit_price,
            total: item.total,
            product_handle: item.product_handle,
            variant_title: item.variant_title,
            variant_option_values: item.variant_option_values,
          })
        )
      : [],
    currencyCode,
    subtotal,
    hasItems,
  }
}
