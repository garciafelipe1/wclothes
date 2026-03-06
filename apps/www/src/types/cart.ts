export type CartAddress = {
  address_1?: string
  address_2?: string
  city?: string
  province?: string
  postal_code?: string
  country_code?: string
  phone?: string
  first_name?: string
  last_name?: string
}

export type CartItem = {
  id: string
  title?: string
  quantity?: number
  thumbnail?: string | null
  unit_price?: number
  total?: number
  variant?: { title?: string } | null
  variant_title?: string | null
}

export type Cart = {
  id: string
  region_id?: string
  email?: string
  currency_code?: string
  items?: CartItem[]
  subtotal?: number
  item_subtotal?: number
  total?: number
  shipping_total?: number
  shipping_address?: CartAddress | null
  payment_collection?: unknown
  shipping_methods?: unknown[]
}
