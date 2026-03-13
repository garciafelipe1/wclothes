import { GetStoreCustomSchema } from "../validators"

describe("GetStoreCustomSchema", () => {
  it("accepts empty query", () => {
    const result = GetStoreCustomSchema.safeParse({})
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.q).toBeUndefined()
      expect(result.data.order).toBeUndefined()
      expect(result.data.page).toBeUndefined()
    }
  })

  it("parses q as optional string", () => {
    const result = GetStoreCustomSchema.safeParse({ q: "zapato" })
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.q).toBe("zapato")
  })

  it("parses valid order values", () => {
    const orders = ["price_asc", "price_desc", "created_at_asc", "created_at_desc"]
    for (const order of orders) {
      const result = GetStoreCustomSchema.safeParse({ order })
      expect(result.success).toBe(true)
      if (result.success) expect(result.data.order).toBe(order)
    }
  })

  it("rejects invalid order", () => {
    const result = GetStoreCustomSchema.safeParse({ order: "invalid" })
    expect(result.success).toBe(false)
  })

  it("transforms category only when in allowed list", () => {
    const valid = GetStoreCustomSchema.safeParse({ category: "Calzado" })
    expect(valid.success).toBe(true)
    if (valid.success) expect(valid.data.category).toBe("Calzado")

    const invalid = GetStoreCustomSchema.safeParse({ category: "Otro" })
    expect(invalid.success).toBe(true)
    if (invalid.success) expect(invalid.data.category).toBeUndefined()
  })

  it("parses sale as boolean from string", () => {
    const withSale = GetStoreCustomSchema.safeParse({ sale: "1" })
    expect(withSale.success).toBe(true)
    if (withSale.success) expect(withSale.data.sale).toBe(true)

    const withTrue = GetStoreCustomSchema.safeParse({ sale: "true" })
    expect(withTrue.success).toBe(true)
    if (withTrue.success) expect(withTrue.data.sale).toBe(true)

    const noSale = GetStoreCustomSchema.safeParse({ sale: "0" })
    expect(noSale.success).toBe(true)
    if (noSale.success) expect(noSale.data.sale).toBe(false)
  })

  it("trims color and talle", () => {
    const color = GetStoreCustomSchema.safeParse({ color: "  rojo  " })
    expect(color.success).toBe(true)
    if (color.success) expect(color.data.color).toBe("rojo")

    const talle = GetStoreCustomSchema.safeParse({ talle: " M " })
    expect(talle.success).toBe(true)
    if (talle.success) expect(talle.data.talle).toBe("M")
  })

  it("coerces string page to number", () => {
    const result = GetStoreCustomSchema.safeParse({ page: "3" })
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.page).toBe(3)
  })

  it("rejects page < 1", () => {
    const result = GetStoreCustomSchema.safeParse({ page: 0 })
    expect(result.success).toBe(false)
  })

  it("coerces min_price and max_price from string", () => {
    const result = GetStoreCustomSchema.safeParse({
      min_price: "1000",
      max_price: "50000",
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.min_price).toBe(1000)
      expect(result.data.max_price).toBe(50000)
    }
  })

  it("accepts region_id and currency_code", () => {
    const result = GetStoreCustomSchema.safeParse({
      region_id: "reg_01",
      currency_code: "ars",
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.region_id).toBe("reg_01")
      expect(result.data.currency_code).toBe("ars")
    }
  })
})
