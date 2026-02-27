"use server"

import { medusa } from "@/lib/medusa"
import { getCartId, clearCartId } from "@/lib/data/cookies"

export type PaymentMethod = "mercadopago" | "retiro_local"

export type CompleteCartResult =
  | { success: true; orderId: string }
  | { success: false; error: string }

const MANUAL_PAYMENT_PROVIDER_ID = "pp_system_default"

/**
 * Completa el carrito y crea la orden en Medusa.
 * Para "Retiro en el local" (pago manual) se inicia antes la sesión de pago con el proveedor manual.
 * Si tiene éxito, borra la cookie del carrito.
 */
export async function completeCartAction(paymentMethod: PaymentMethod = "mercadopago"): Promise<CompleteCartResult> {
  const cartId = await getCartId()
  if (!cartId) {
    return { success: false, error: "No hay carrito" }
  }

  try {
    const { cart } = await medusa.store.cart.retrieve(cartId, {
      fields: "id,region_id,total,payment_collection,*payment_collection,shipping_methods",
    })
    if (!cart) {
      return { success: false, error: "No se pudo cargar el carrito" }
    }

    const hasShippingMethods =
      Array.isArray((cart as { shipping_methods?: unknown[] }).shipping_methods) &&
      (cart as { shipping_methods: unknown[] }).shipping_methods.length > 0

    if (!hasShippingMethods) {
      const { shipping_options } = await medusa.store.fulfillment.listCartOptions({
        cart_id: cartId,
      })
      const options = Array.isArray(shipping_options) ? shipping_options : []
      const firstOption = options[0] as { id: string } | undefined
      if (!firstOption?.id) {
        return { success: false, error: "No hay opciones de envío disponibles para tu carrito. Revisá la dirección." }
      }
      await medusa.store.cart.addShippingMethod(cartId, {
        option_id: firstOption.id,
        data: {},
      })
    }

    if (paymentMethod === "retiro_local") {
      await medusa.store.payment.initiatePaymentSession(
        cart as { id: string; region_id?: string; total?: number; payment_collection?: unknown },
        { provider_id: MANUAL_PAYMENT_PROVIDER_ID, data: {} }
      )
    }

    const data = await medusa.store.cart.complete(cartId)

    if (data.type === "cart" && data.cart) {
      const errorMsg =
        data.error ?? (typeof data.cart === "object" && data.cart && "message" in data.cart
          ? String((data.cart as { message?: string }).message)
          : "No se pudo completar el pedido")
      return { success: false, error: String(errorMsg) }
    }

    if (data.type === "order" && data.order?.id) {
      await clearCartId()
      return { success: true, orderId: data.order.id }
    }

    return { success: false, error: "Respuesta inesperada del servidor" }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    return { success: false, error: msg }
  }
}
