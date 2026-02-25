import type { CatalogProduct } from "@/components/catalog"

/**
 * Productos de ejemplo estilo Toteme (https://int.toteme.com/collections/shoes)
 * para que el catálogo se vea lleno. Se mezclan con los productos del backend.
 */
export const DEMO_PRODUCTS: CatalogProduct[] = [
  {
    id: "demo-1",
    title: "Slip nappa ballerinas black",
    handle: "slip-nappa-ballerinas-black",
    thumbnail: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600&q=80",
    thumbnailHover: "https://images.unsplash.com/photo-1603808033192-082d6919d2e1?w=600&q=80",
    variants: [{ calculated_price: { calculated_amount: 59000, currency_code: "eur" } }],
  },
  {
    id: "demo-2",
    title: "Slip suede ballerinas black",
    handle: "slip-suede-ballerinas-black",
    thumbnail: "https://images.unsplash.com/photo-1535043934128-cf0b28d52f95?w=600&q=80",
    thumbnailHover: "https://images.unsplash.com/photo-1603808033192-082d6919d2e1?w=600&q=80",
    variants: [{ calculated_price: { calculated_amount: 59000, currency_code: "eur" } }],
  },
  {
    id: "demo-3",
    title: "Slip suede ballerinas cashew",
    handle: "slip-suede-ballerinas-cashew",
    thumbnail: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&q=80",
    thumbnailHover: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80",
    variants: [{ calculated_price: { calculated_amount: 59000, currency_code: "eur" } }],
  },
  {
    id: "demo-4",
    title: "Minimalist suede ballerinas black",
    handle: "minimalist-suede-ballerinas-black",
    thumbnail: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=600&q=80",
    thumbnailHover: "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=600&q=80",
    variants: [{ calculated_price: { calculated_amount: 59000, currency_code: "eur" } }],
  },
  {
    id: "demo-5",
    title: "Contour nappa slingback black",
    handle: "contour-nappa-slingback-black",
    thumbnail: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600&q=80",
    thumbnailHover: "https://images.unsplash.com/photo-1535043934128-cf0b28d52f95?w=600&q=80",
    variants: [{ calculated_price: { calculated_amount: 58000, currency_code: "eur" } }],
  },
  {
    id: "demo-6",
    title: "Contour nappa slingback flamingo",
    handle: "contour-nappa-slingback-flamingo",
    thumbnail: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600&q=80",
    thumbnailHover: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&q=80",
    variants: [{ calculated_price: { calculated_amount: 58000, currency_code: "eur" } }],
  },
  {
    id: "demo-7",
    title: "Slip patent ballerinas black",
    handle: "slip-patent-ballerinas-black",
    thumbnail: "https://images.unsplash.com/photo-1535043934128-cf0b28d52f95?w=600&q=80",
    thumbnailHover: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=600&q=80",
    variants: [{ calculated_price: { calculated_amount: 44000, currency_code: "eur" } }],
  },
  {
    id: "demo-8",
    title: "Minimalist suede ballerinas navy",
    handle: "minimalist-suede-ballerinas-navy",
    thumbnail: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&q=80",
    thumbnailHover: "https://images.unsplash.com/photo-1603487742131-4160ec999306?w=600&q=80",
    variants: [{ calculated_price: { calculated_amount: 59000, currency_code: "eur" } }],
  },
]
