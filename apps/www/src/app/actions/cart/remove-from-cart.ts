"use server"

import { medusa } from "@/lib/medusa"
import { getCartId } from "@/lib/data/cookies"

/**
 * Elimina un ítem del carrito.
 */
export async function removeFromCartAction(
  lineItemId: string
): Promise<{ success: boolean; error?: string }> {
  const cartId = await getCartId()
  if (!cartId) return { success: false, error: "No hay carrito" }

  try {
    await medusa.store.cart.deleteLineItem(cartId, lineItemId)
    return { success: true }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    return { success: false, error: msg }
  }
}
