import { cookies } from "next/headers"

const CART_COOKIE = "medusa_cart_id"

export async function getCartId(): Promise<string | null> {
  const c = await cookies()
  return c.get(CART_COOKIE)?.value ?? null
}

export async function setCartId(cartId: string): Promise<void> {
  const c = await cookies()
  c.set(CART_COOKIE, cartId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  })
}

export async function clearCartId(): Promise<void> {
  const c = await cookies()
  c.delete(CART_COOKIE)
}
