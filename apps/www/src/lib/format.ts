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
