import { describe, it, expect } from "vitest"
import { mapMedusaProductToCatalog } from "../product-mapping"

describe("mapMedusaProductToCatalog", () => {
  it("maps id, title, handle to string or null", () => {
    const raw = {
      id: "prod_01",
      title: "Remera",
      handle: "remera",
    }
    const out = mapMedusaProductToCatalog(raw)
    expect(out.id).toBe("prod_01")
    expect(out.title).toBe("Remera")
    expect(out.handle).toBe("remera")
  })

  it("converts non-string title/handle to null", () => {
    const out = mapMedusaProductToCatalog({
      id: 123,
      title: 456,
      handle: null,
    } as unknown as Record<string, unknown>)
    expect(out.id).toBe("123")
    expect(out.title).toBeNull()
    expect(out.handle).toBeNull()
  })

  it("uses thumbnail when present, else first image", () => {
    const withThumb = mapMedusaProductToCatalog({
      id: "1",
      thumbnail: "https://thumb.jpg",
      images: [{ url: "https://first.jpg" }],
    } as unknown as Record<string, unknown>)
    expect(withThumb.thumbnail).toBe("https://thumb.jpg")

    const noThumb = mapMedusaProductToCatalog({
      id: "1",
      images: [{ url: "https://first.jpg" }],
    } as unknown as Record<string, unknown>)
    expect(noThumb.thumbnail).toBe("https://first.jpg")
  })

  it("sets thumbnailHover from second image when available", () => {
    const out = mapMedusaProductToCatalog({
      id: "1",
      images: [{ url: "https://a.jpg" }, { url: "https://b.jpg" }],
    } as unknown as Record<string, unknown>)
    expect(out.thumbnailHover).toBe("https://b.jpg")
  })

  it("extracts color values from variants with Color/Colour option", () => {
    const raw = {
      id: "1",
      variants: [
        {
          options: [
            { option: { title: "Color" }, value: "Rojo" },
            { option: { title: "Talle" }, value: "M" },
          ],
        },
        {
          options: [
            { option: { title: "Colour" }, value: "Azul" },
          ],
        },
      ],
    }
    const out = mapMedusaProductToCatalog(raw as unknown as Record<string, unknown>)
    expect(out.colorValues).toHaveLength(2)
    expect(out.colorValues).toContain("Rojo")
    expect(out.colorValues).toContain("Azul")
  })

  it("maps variants with calculated_price", () => {
    const raw = {
      id: "1",
      variants: [
        {
          calculated_price: {
            calculated_amount: 9990,
            currency_code: "ars",
          },
        },
      ],
    }
    const out = mapMedusaProductToCatalog(raw as unknown as Record<string, unknown>)
    expect(out.variants).toHaveLength(1)
    expect(out.variants![0].calculated_price?.calculated_amount).toBe(9990)
    expect(out.variants![0].calculated_price?.currency_code).toBe("ars")
  })

  it("handles empty or missing variants", () => {
    const empty = mapMedusaProductToCatalog({
      id: "1",
      variants: [],
    } as unknown as Record<string, unknown>)
    expect(empty.variants).toEqual([])
    expect(empty.colorValues).toEqual([])

    const noVariants = mapMedusaProductToCatalog({ id: "1" })
    expect(noVariants.variants).toEqual([])
    expect(noVariants.colorValues).toEqual([])
  })
})
