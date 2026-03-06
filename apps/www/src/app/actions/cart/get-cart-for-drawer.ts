"use server"

import { clearCartId, getCartId } from "@/lib/data/cookies"
import { getCartWithItems } from "@/services/cart.service"
import { productService } from "@/services/product.service"

/**
 * Enriquece items del carrito con variant_option_values (Color, Talle)
 * cuando Medusa no los devuelve. Obtiene los datos del producto por handle.
 */
async function enrichItemVariantOptions(
  item: {
    variant_id?: string
    product_handle?: string
    variant_option_values?: Record<string, unknown>
    variant_title?: string | null
  }
): Promise<Record<string, unknown> | undefined> {
  if (item.variant_option_values != null && typeof item.variant_option_values === "object" && Object.keys(item.variant_option_values).length > 0) {
    return item.variant_option_values as Record<string, unknown>
  }
  if (!item.product_handle || !item.variant_id) return undefined
  try {
    const product = await productService.getByHandle(item.product_handle)
    if (!product?.options?.length || !product?.variants?.length) return undefined
    const variant = product.variants.find((v) => v.id === item.variant_id)
    if (!variant?.options?.length) return undefined
    const optionTitles = new Map<string, string>()
    for (const o of product.options) {
      if (o.id && o.title) optionTitles.set(o.id, o.title)
    }
    const result: Record<string, string> = {}
    for (const vo of variant.options) {
      const title = vo.option_id ? optionTitles.get(vo.option_id) : null
      if (title && vo.value) result[title] = vo.value
    }
    return Object.keys(result).length > 0 ? result : undefined
  } catch {
    return undefined
  }
}

/**
 * Devuelve los datos del carrito para el drawer (serializable).
 * Enriquece variant_option_values (Color, Talle) si faltan.
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
  if (cartId && !cart) {
    await clearCartId()
  }
  const items = cart?.items ?? []
  const hasItems = Array.isArray(items) && items.length > 0
  const currencyCode = cart?.currency_code ?? "ars"
  const subtotal = cart?.subtotal ?? cart?.item_subtotal ?? cart?.total ?? 0

  const enrichedItems = await Promise.all(
    items.map(
      async (
        item: {
          id: string
          variant_id?: string
          title?: string
          quantity?: number
          thumbnail?: string | null
          unit_price?: number
          total?: number
          product_handle?: string
          variant_title?: string | null
          variant_option_values?: Record<string, unknown>
        }
      ) => {
        const variantOptionValues = (await enrichItemVariantOptions(item)) ?? item.variant_option_values
        return {
          id: item.id,
          title: item.title,
          quantity: item.quantity,
          thumbnail: item.thumbnail,
          unit_price: item.unit_price,
          total: item.total,
          product_handle: item.product_handle,
          variant_title: item.variant_title,
          variant_option_values: variantOptionValues,
        }
      }
    )
  )

  return {
    items: enrichedItems,
    currencyCode,
    subtotal,
    hasItems,
  }
}
