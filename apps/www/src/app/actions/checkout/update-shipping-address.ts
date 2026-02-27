"use server"

import { medusa } from "@/lib/medusa"
import { getCartId } from "@/lib/data/cookies"

export type ShippingAddressInput = {
  email?: string
  first_name: string
  last_name: string
  address_1: string
  address_2?: string
  city: string
  postal_code: string
  country_code: string
  province?: string
  phone?: string
  company?: string
}

/**
 * Actualiza email y dirección de envío del carrito en Medusa.
 */
export async function updateCartShippingAddressAction(
  input: ShippingAddressInput
): Promise<{ success: boolean; error?: string }> {
  const cartId = await getCartId()
  if (!cartId) return { success: false, error: "No hay carrito" }

  const {
    email,
    first_name,
    last_name,
    address_1,
    address_2,
    city,
    postal_code,
    country_code,
    province,
    phone,
    company,
  } = input

  if (!first_name?.trim() || !last_name?.trim() || !address_1?.trim() || !city?.trim() || !postal_code?.trim() || !country_code?.trim()) {
    return { success: false, error: "Completá los campos obligatorios" }
  }

  try {
    await medusa.store.cart.update(cartId, {
      ...(email?.trim() && { email: email.trim() }),
      shipping_address: {
        first_name: first_name.trim(),
        last_name: last_name.trim(),
        address_1: address_1.trim(),
        ...(address_2?.trim() && { address_2: address_2.trim() }),
        city: city.trim(),
        postal_code: postal_code.trim(),
        country_code: country_code.toLowerCase().trim(),
        ...(province?.trim() && { province: province.trim().toLowerCase() }),
        ...(phone?.trim() && { phone: phone.trim() }),
        ...(company?.trim() && { company: company.trim() }),
      },
    })
    return { success: true }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    return { success: false, error: msg }
  }
}
