"use server"

import { medusa } from "@/lib/medusa"
import { getCartId } from "@/lib/data/cookies"

/**
 * Actualiza la cantidad de un ítem del carrito.
 */
export async function updateCartItemQuantityAction(
  lineItemId: string,
  quantity: number
): Promise<{ success: boolean; error?: string }> {
  const cartId = await getCartId()
  if (!cartId) return { success: false, error: "No hay carrito" }

  if (quantity < 1) return { success: false, error: "Cantidad mínima 1" }

  try {
    await medusa.store.cart.updateLineItem(cartId, lineItemId, { quantity })
    return { success: true }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    return { success: false, error: msg }
  }
}
