import { getLowestPrice, type ProductWithCalculatedPrice } from "../get-lowest-price"

describe("getLowestPrice", () => {
  it("returns 0 when product has no variants", () => {
    const product: ProductWithCalculatedPrice = { variants: [] }
    expect(getLowestPrice(product)).toBe(0)
  })

  it("returns 0 when product has undefined variants", () => {
    expect(getLowestPrice({})).toBe(0)
  })

  it("returns 0 when all variants have no calculated_price", () => {
    const product: ProductWithCalculatedPrice = {
      variants: [
        {},
        { calculated_price: {} },
        { calculated_price: { calculated_amount: undefined } },
      ],
    }
    expect(getLowestPrice(product)).toBe(0)
  })

  it("returns the only variant price", () => {
    const product: ProductWithCalculatedPrice = {
      variants: [{ calculated_price: { calculated_amount: 9990 } }],
    }
    expect(getLowestPrice(product)).toBe(9990)
  })

  it("returns the lowest price among multiple variants", () => {
    const product: ProductWithCalculatedPrice = {
      variants: [
        { calculated_price: { calculated_amount: 15000 } },
        { calculated_price: { calculated_amount: 8900 } },
        { calculated_price: { calculated_amount: 12000 } },
      ],
    }
    expect(getLowestPrice(product)).toBe(8900)
  })

  it("ignores non-numeric calculated_amount", () => {
    const product = {
      variants: [
        { calculated_price: { calculated_amount: "invalid" as unknown as number } },
        { calculated_price: { calculated_amount: 5000 } },
      ],
    } as ProductWithCalculatedPrice
    expect(getLowestPrice(product)).toBe(5000)
  })
})
