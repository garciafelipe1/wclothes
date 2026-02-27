import { medusa } from "@/lib/medusa"
import { getCartId, setCartId } from "@/lib/data/cookies"
import { getRegionByCountryCode } from "@/lib/data/regions"

export type Cart = Record<string, unknown>

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
      return cart ?? null
    } catch {
      cartId = null
    }
  }

  if (!cartId) {
    try {
const { cart } = await medusa.store.cart.create({
    region_id: region.id,
  })
      if (cart?.id) {
        await setCartId(cart.id)
        return cart
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
    return cart ?? null
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
    return cart ?? null
  } catch {
    return null
  }
}

/**
 * Devuelve la cantidad de ítems en el carrito (para el badge del nav).
 * Usar desde Server Components (ej. layout).
 */
export async function getCartCount(): Promise<number> {
  const cartId = await getCartId()
  if (!cartId) return 0
  try {
    const { cart } = await medusa.store.cart.retrieve(cartId, {
      fields: "items",
    })
    const items = cart?.items ?? []
    return Array.isArray(items) ? items.length : 0
  } catch {
    return 0
  }
}
