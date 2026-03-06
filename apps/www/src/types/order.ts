export type OrderItem = {
  id: string
  title?: string
  quantity?: number
  thumbnail?: string | null
  unit_price?: number
  total?: number
  variant?: { title?: string } | null
}

export type OrderSummary = {
  total?: number
  subtotal?: number
  shipping_total?: number
}

export type Order = {
  id: string
  display_id?: string | number
  email?: string
  status?: string
  payment_status?: string
  fulfillment_status?: string
  created_at?: string
  currency_code?: string
  total?: number
  subtotal?: number
  shipping_total?: number
  items?: OrderItem[]
  shipping_address?: {
    address_1?: string
    postal_code?: string
    city?: string
    province?: string
    phone?: string
  } | null
  shipping_methods?: unknown[]
  summary?: OrderSummary
}
