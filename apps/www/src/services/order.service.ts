import { medusa } from "@/lib/medusa"

export type Order = any

/**
 * Obtiene una orden por ID (p. ej. después de completar el checkout).
 * Store API puede requerir que la orden corresponda al contexto del cliente.
 */
export async function getOrderById(orderId: string | null): Promise<Order | null> {
  if (!orderId) return null
  try {
    const { order } = await medusa.store.order.retrieve(orderId, {
      fields: "id,display_id,email,status,payment_status,fulfillment_status,created_at,currency_code,*items,*shipping_address,*shipping_methods,summary",
    })
    return order ?? null
  } catch {
    return null
  }
}

const BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9001"

/**
 * Lista órdenes por email (GET /store/orders?email= en el backend).
 */
export async function getOrdersByEmail(email: string): Promise<Order[]> {
  const trimmed = email?.trim()
  if (!trimmed) return []
  try {
    const url = `${BACKEND_URL}/store/orders?email=${encodeURIComponent(trimmed)}`
    const res = await fetch(url, { next: { revalidate: 0 } })
    if (!res.ok) return []
    const json = (await res.json()) as { orders?: Order[] }
    return Array.isArray(json.orders) ? json.orders : []
  } catch {
    return []
  }
}
