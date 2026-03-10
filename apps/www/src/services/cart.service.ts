import { medusa } from "@/lib/medusa"
import { clearCartId, getCartId, setCartId } from "@/lib/data/cookies"
import { getRegionByCountryCode } from "@/lib/data/regions"
import type { Cart } from "@/types/cart"

export type { Cart }

/**
 * Obtiene el carrito actual o crea uno nuevo para el país dado.
 * Usar desde Server Components o Server Actions.
 */
export async function getOrSetCart(countryCode: string): Promise<Cart | null> {
  const region = await getRegionByCountryCode(countryCode)
  if (!region) return null

  let cartId = await getCartId()

  if (cartId) {
    try {
      const { cart } = await medusa.store.cart.retrieve(cartId)
      return (cart as Cart) ?? null
    } catch {
      await clearCartId()
      cartId = null
    }
  }

  if (!cartId) {
    try {
      const { cart } = await medusa.store.cart.create({ region_id: region.id })
      if (cart?.id) {
        await setCartId(cart.id)
        return cart as Cart
      }
    } catch (e) {
      console.warn("[getOrSetCart] create failed", e)
    }
  }

  return null
}

/**
 * Obtiene el carrito por ID (sin crear). Para uso en Server Actions.
 */
export async function getCart(cartId: string | null): Promise<Cart | null> {
  if (!cartId) return null
  try {
    const { cart } = await medusa.store.cart.retrieve(cartId)
    return (cart as Cart) ?? null
  } catch {
    return null
  }
}

/**
 * Obtiene el carrito con ítems y totales expandidos. Para la página del carrito.
 */
export async function getCartWithItems(cartId: string | null): Promise<Cart | null> {
  if (!cartId) return null
  try {
    const { cart } = await medusa.store.cart.retrieve(cartId, {
      fields: "+items.*",
    })
    return (cart as Cart) ?? null
  } catch {
    return null
  }
}

/**
 * Devuelve la cantidad de ítems en el carrito (para el badge del nav).
 * Usar desde Server Components (ej. layout). No modifica cookies (no permitido en render).
 * Timeout corto para no bloquear el render si el backend no responde (evita 502 en deploy).
 */
export async function getCartCount(): Promise<number> {
  const cartId = await getCartId()
  if (!cartId) return 0
  try {
    const timeoutMs = 3000
    const { cart } = await Promise.race([
      medusa.store.cart.retrieve(cartId, { fields: "items" }),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("getCartCount timeout")), timeoutMs)
      ),
    ])
    const items = cart?.items ?? []
    return Array.isArray(items) ? items.length : 0
  } catch {
    // No llamar clearCartId() aquí: las cookies solo se pueden modificar en Server Actions o Route Handlers.
    return 0
  }
}
