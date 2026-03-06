import { getCartId } from "@/lib/data/cookies"
import { getCartWithItems, type Cart } from "@/services/cart.service"
import type { CartItem } from "@/types/cart"

export type CheckoutData = {
  cart: Cart | null
  cartId: string | null
  items: CartItem[]
  hasItems: boolean
  currencyCode: string
  subtotal: number
  shippingTotal: number
  total: number
  email: string
  shippingAddress: Cart["shipping_address"]
}

export async function getCheckoutData(): Promise<CheckoutData> {
  const cartId = await getCartId()
  const cart = await getCartWithItems(cartId)
  const items = cart?.items ?? []
  const hasItems = Array.isArray(items) && items.length > 0
  const currencyCode = cart?.currency_code ?? "ars"
  const subtotal = cart?.subtotal ?? cart?.item_subtotal ?? cart?.total ?? 0
  const shippingTotal = cart?.shipping_total ?? 0
  const total = cart?.total ?? subtotal
  const email = cart?.email ?? ""
  const shippingAddress = cart?.shipping_address ?? null

  return {
    cart,
    cartId,
    items,
    hasItems,
    currencyCode,
    subtotal,
    shippingTotal,
    total,
    email,
    shippingAddress,
  }
}
