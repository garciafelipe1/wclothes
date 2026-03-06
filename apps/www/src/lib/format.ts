/**
 * Formatea un monto en centavos con código de moneda.
 * Usable en Server y Client Components.
 */
export function formatPrice(amount?: number, code?: string): string {
  if (amount == null) return "—"
  const currency =
    code === "usd" ? "USD" : code === "ars" ? "ARS" : (code ?? "").toUpperCase()
  return `${(amount / 100).toLocaleString("es-AR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })} ${currency}`
}

export function formatShippingAddress(addr: {
  address_1?: string
  postal_code?: string
  city?: string
  province?: string
  phone?: string
} | null | undefined): string {
  if (!addr) return ""
  const parts: string[] = []
  if (addr.address_1) parts.push(addr.address_1)
  if (addr.postal_code) parts.push(`CP ${addr.postal_code}`)
  const cityProv = [addr.city, addr.province].filter(Boolean).join(", ")
  const lastLine = addr.phone ? `${cityProv} - ${addr.phone}` : cityProv
  if (lastLine) parts.push(lastLine)
  return parts.filter(Boolean).join("\n")
}
