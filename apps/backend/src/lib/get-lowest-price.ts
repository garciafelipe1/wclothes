/**
 * Returns the lowest calculated price among all variants (for sorting/filtering).
 */
export type ProductWithCalculatedPrice = {
  variants?: Array<{
    calculated_price?: { calculated_amount?: number }
  }>
}

export function getLowestPrice(
  product: ProductWithCalculatedPrice
): number {
  let lowest = Infinity
  for (const v of product.variants ?? []) {
    const amount = v.calculated_price?.calculated_amount
    if (typeof amount === "number") {
      lowest = Math.min(lowest, amount)
    }
  }
  return lowest === Infinity ? 0 : lowest
}
