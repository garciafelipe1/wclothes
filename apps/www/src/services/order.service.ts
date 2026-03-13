import { medusa } from "@/lib/medusa"
import { getMedusaBaseUrl } from "@/lib/env"
import type { Order } from "@/types/order"

export type { Order }

const ORDER_FIELDS = "id,display_id,email,status,payment_status,fulfillment_status,created_at,currency_code,*items,*shipping_address,*shipping_methods,summary"

export async function getOrderById(orderId: string | null): Promise<Order | null> {
  if (!orderId) return null
  try {
    const { order } = await medusa.store.order.retrieve(orderId, {
      fields: ORDER_FIELDS,
    })
    return (order as Order) ?? null
  } catch {
    return null
  }
}

/**
 * Lists orders by email via custom backend route.
 * Uses the same backend URL configured for the Medusa client.
 */
export async function getOrdersByEmail(email: string): Promise<Order[]> {
  const trimmed = email?.trim()
  if (!trimmed) return []
  try {
    const backendUrl = getMedusaBaseUrl()
    const url = `${backendUrl}/store/orders?email=${encodeURIComponent(trimmed)}`
    const res = await fetch(url, { next: { revalidate: 0 } })
    if (!res.ok) return []
    const json = (await res.json()) as { orders?: Order[] }
    return Array.isArray(json.orders) ? json.orders : []
  } catch {
    return []
  }
}
