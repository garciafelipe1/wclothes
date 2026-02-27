"use server"

import { medusa } from "@/lib/medusa"
import { getCartId, setCartId } from "@/lib/data/cookies"
import { getRegionByCountryCode } from "@/lib/data/regions"

type AddToCartInput = {
  variantId: string
  quantity?: number
  countryCode: string
}

/**
 * Crea o reutiliza el carrito y agrega una línea.
 * Devuelve { success, cartId, error }.
 */
export async function addToCartAction(input: AddToCartInput): Promise<{
  success: boolean
  cartId?: string
  error?: string
}> {
  const { variantId, quantity = 1, countryCode } = input

  const region = await getRegionByCountryCode(countryCode)
  if (!region) {
    return { success: false, error: "Región no disponible" }
  }

  let cartId = await getCartId()

  if (!cartId) {
    try {
      const { cart } = await medusa.store.cart.create({
        region_id: region.id,
      })
      if (cart?.id) {
        await setCartId(cart.id)
        cartId = cart.id
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      return { success: false, error: msg }
    }
  }

  if (!cartId) {
    return { success: false, error: "No se pudo crear el carrito" }
  }

  try {
    await medusa.store.cart.createLineItem(cartId, {
      variant_id: variantId,
      quantity,
    })
    return { success: true, cartId }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    return { success: false, error: msg, cartId }
  }
}
