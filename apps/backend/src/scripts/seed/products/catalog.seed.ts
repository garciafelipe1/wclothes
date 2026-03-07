/**
 * Productos de catálogo: se cargan en la base con el script seed.
 * Imágenes: URLs públicas (Unsplash o tu CDN). Para hover, poné 2+ imágenes por producto.
 */
import { CATEGORIES } from "../../../shared/constants"

export type SeedProductItem = {
  title: string
  description: string
  images: string[]
  category: (typeof CATEGORIES)[keyof typeof CATEGORIES]
  price: { ars: number; usd: number }
  metadata?: Record<string, unknown>
  /** Custom options (e.g. Color, Talle). If omitted, uses Default. */
  productOptions?: Array<{ title: string; values: string[] }>
  /** Custom variant options map. Required when productOptions is set. One entry per variant. */
  variantOptions?: Array<Record<string, string>>
}

export const catalogProducts: SeedProductItem[] = [
  {
    title: "Slip nappa ballerinas black",
    description: "Ballerinas de napa negra. Diseño minimalista.",
    images: [
      "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600&q=80",
      "https://images.unsplash.com/photo-1603808033192-082d6919d2e1?w=600&q=80",
    ],
    category: CATEGORIES.calzado,
    price: { ars: 59000 * 100, usd: 590 * 100 },
    productOptions: [
      { title: "Color", values: ["Negro", "Blanco"] },
      { title: "Talle", values: ["1", "2", "3", "4"] },
    ],
    variantOptions: [
      { Color: "Negro", Talle: "1" },
      { Color: "Negro", Talle: "2" },
      { Color: "Negro", Talle: "3" },
      { Color: "Negro", Talle: "4" },
      { Color: "Blanco", Talle: "1" },
      { Color: "Blanco", Talle: "2" },
      { Color: "Blanco", Talle: "3" },
      { Color: "Blanco", Talle: "4" },
    ],
  },
  {
    title: "Slip suede ballerinas black",
    description: "Ballerinas de gamuza negra.",
    images: [
      "https://images.unsplash.com/photo-1535043934128-cf0b28d52f95?w=600&q=80",
      "https://images.unsplash.com/photo-1603808033192-082d6919d2e1?w=600&q=80",
    ],
    category: CATEGORIES.calzado,
    price: { ars: 59000 * 100, usd: 590 * 100 },
    productOptions: [
      { title: "Color", values: ["Negro", "Blanco"] },
      { title: "Talle", values: ["1", "2", "3", "4"] },
    ],
    variantOptions: [
      { Color: "Negro", Talle: "1" },
      { Color: "Negro", Talle: "2" },
      { Color: "Negro", Talle: "3" },
      { Color: "Negro", Talle: "4" },
      { Color: "Blanco", Talle: "1" },
      { Color: "Blanco", Talle: "2" },
      { Color: "Blanco", Talle: "3" },
      { Color: "Blanco", Talle: "4" },
    ],
  },
  {
    title: "Slip suede ballerinas cashew",
    description: "Ballerinas de gamuza color castaño.",
    images: [
      "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&q=80",
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80",
    ],
    category: CATEGORIES.calzado,
    price: { ars: 59000 * 100, usd: 590 * 100 },
    productOptions: [
      { title: "Color", values: ["Castaño", "Negro"] },
      { title: "Talle", values: ["1", "2", "3", "4"] },
    ],
    variantOptions: [
      { Color: "Castaño", Talle: "1" },
      { Color: "Castaño", Talle: "2" },
      { Color: "Castaño", Talle: "3" },
      { Color: "Castaño", Talle: "4" },
      { Color: "Negro", Talle: "1" },
      { Color: "Negro", Talle: "2" },
      { Color: "Negro", Talle: "3" },
      { Color: "Negro", Talle: "4" },
    ],
  },
  {
    title: "Minimalist suede ballerinas black",
    description: "Ballerinas minimalistas de gamuza negra.",
    images: [
      "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=600&q=80",
      "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=600&q=80",
    ],
    category: CATEGORIES.calzado,
    price: { ars: 59000 * 100, usd: 590 * 100 },
    productOptions: [
      { title: "Color", values: ["Negro", "Blanco", "Gris"] },
      { title: "Talle", values: ["1", "2", "3", "4"] },
    ],
    variantOptions: [
      { Color: "Negro", Talle: "1" },
      { Color: "Negro", Talle: "2" },
      { Color: "Negro", Talle: "3" },
      { Color: "Negro", Talle: "4" },
      { Color: "Blanco", Talle: "1" },
      { Color: "Blanco", Talle: "2" },
      { Color: "Blanco", Talle: "3" },
      { Color: "Blanco", Talle: "4" },
      { Color: "Gris", Talle: "1" },
      { Color: "Gris", Talle: "2" },
      { Color: "Gris", Talle: "3" },
      { Color: "Gris", Talle: "4" },
    ],
  },
  {
    title: "Contour nappa slingback black",
    description: "Slingback de napa negra.",
    images: [
      "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600&q=80",
      "https://images.unsplash.com/photo-1535043934128-cf0b28d52f95?w=600&q=80",
    ],
    category: CATEGORIES.calzado,
    price: { ars: 58000 * 100, usd: 580 * 100 },
    productOptions: [
      { title: "Color", values: ["Negro", "Blanco"] },
      { title: "Talle", values: ["1", "2", "3", "4"] },
    ],
    variantOptions: [
      { Color: "Negro", Talle: "1" },
      { Color: "Negro", Talle: "2" },
      { Color: "Negro", Talle: "3" },
      { Color: "Negro", Talle: "4" },
      { Color: "Blanco", Talle: "1" },
      { Color: "Blanco", Talle: "2" },
      { Color: "Blanco", Talle: "3" },
      { Color: "Blanco", Talle: "4" },
    ],
  },
  {
    title: "Contour nappa slingback flamingo",
    description: "Slingback de napa color flamenco.",
    images: [
      "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600&q=80",
      "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&q=80",
    ],
    category: CATEGORIES.calzado,
    price: { ars: 58000 * 100, usd: 580 * 100 },
    productOptions: [
      { title: "Color", values: ["Flamenco", "Negro"] },
      { title: "Talle", values: ["1", "2", "3", "4"] },
    ],
    variantOptions: [
      { Color: "Flamenco", Talle: "1" },
      { Color: "Flamenco", Talle: "2" },
      { Color: "Flamenco", Talle: "3" },
      { Color: "Flamenco", Talle: "4" },
      { Color: "Negro", Talle: "1" },
      { Color: "Negro", Talle: "2" },
      { Color: "Negro", Talle: "3" },
      { Color: "Negro", Talle: "4" },
    ],
  },
  // Remeras (6 productos para llegar a 12 y mostrar el video en el catálogo)
  {
    title: "Remera oversize blessed TSSY",
    description: "Remera oversize de algodón peinado. Corte amplio, cuello redondo. Estilo urbano.",
    images: [
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80",
      "https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=600&q=80",
    ],
    category: CATEGORIES.remeras,
    price: { ars: 49100 * 100, usd: 199 * 100 },
    productOptions: [
      { title: "Color", values: ["Negro", "Blanco"] },
      { title: "Talle", values: ["1", "2", "3", "4"] },
    ],
    variantOptions: [
      { Color: "Negro", Talle: "1" },
      { Color: "Negro", Talle: "2" },
      { Color: "Negro", Talle: "3" },
      { Color: "Negro", Talle: "4" },
      { Color: "Blanco", Talle: "1" },
      { Color: "Blanco", Talle: "2" },
      { Color: "Blanco", Talle: "3" },
      { Color: "Blanco", Talle: "4" },
    ],
  },
  {
    title: "Remera oversize algodón black",
    description: "Remera oversize de algodón peinado. Corte amplio, cuello redondo.",
    images: [
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80",
      "https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=600&q=80",
    ],
    category: CATEGORIES.remeras,
    price: { ars: 18900 * 100, usd: 89 * 100 },
    productOptions: [
      { title: "Color", values: ["Negro", "Blanco", "Gris"] },
      { title: "Talle", values: ["1", "2", "3", "4"] },
    ],
    variantOptions: [
      { Color: "Negro", Talle: "1" },
      { Color: "Negro", Talle: "2" },
      { Color: "Negro", Talle: "3" },
      { Color: "Negro", Talle: "4" },
      { Color: "Blanco", Talle: "1" },
      { Color: "Blanco", Talle: "2" },
      { Color: "Blanco", Talle: "3" },
      { Color: "Blanco", Talle: "4" },
      { Color: "Gris", Talle: "1" },
      { Color: "Gris", Talle: "2" },
      { Color: "Gris", Talle: "3" },
      { Color: "Gris", Talle: "4" },
    ],
  },
  {
    title: "Remera oversize algodón white",
    description: "Remera oversize blanca. Algodón orgánico, unisex.",
    images: [
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&q=80",
      "https://images.unsplash.com/photo-1562157873-818bc0726f68?w=600&q=80",
    ],
    category: CATEGORIES.remeras,
    price: { ars: 18900 * 100, usd: 89 * 100 },
    productOptions: [
      { title: "Color", values: ["Blanco", "Negro", "Gris"] },
      { title: "Talle", values: ["1", "2", "3", "4"] },
    ],
    variantOptions: [
      { Color: "Blanco", Talle: "1" },
      { Color: "Blanco", Talle: "2" },
      { Color: "Blanco", Talle: "3" },
      { Color: "Blanco", Talle: "4" },
      { Color: "Negro", Talle: "1" },
      { Color: "Negro", Talle: "2" },
      { Color: "Negro", Talle: "3" },
      { Color: "Negro", Talle: "4" },
      { Color: "Gris", Talle: "1" },
      { Color: "Gris", Talle: "2" },
      { Color: "Gris", Talle: "3" },
      { Color: "Gris", Talle: "4" },
    ],
  },
  {
    title: "Remera minimalista grey",
    description: "Remera minimalista gris. Tejido suave, corte oversize.",
    images: [
      "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600&q=80",
      "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&q=80",
    ],
    category: CATEGORIES.remeras,
    price: { ars: 16900 * 100, usd: 79 * 100 },
    productOptions: [
      { title: "Color", values: ["Gris", "Negro"] },
      { title: "Talle", values: ["1", "2", "3", "4"] },
    ],
    variantOptions: [
      { Color: "Gris", Talle: "1" },
      { Color: "Gris", Talle: "2" },
      { Color: "Gris", Talle: "3" },
      { Color: "Gris", Talle: "4" },
      { Color: "Negro", Talle: "1" },
      { Color: "Negro", Talle: "2" },
      { Color: "Negro", Talle: "3" },
      { Color: "Negro", Talle: "4" },
    ],
  },
  {
    title: "Remera boxy navy",
    description: "Remera boxy azul marino. Cuello redondo, manga corta.",
    images: [
      "https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=600&q=80",
      "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600&q=80",
    ],
    category: CATEGORIES.remeras,
    price: { ars: 19900 * 100, usd: 99 * 100 },
    productOptions: [
      { title: "Color", values: ["Azul marino", "Blanco"] },
      { title: "Talle", values: ["1", "2", "3", "4"] },
    ],
    variantOptions: [
      { Color: "Azul marino", Talle: "1" },
      { Color: "Azul marino", Talle: "2" },
      { Color: "Azul marino", Talle: "3" },
      { Color: "Azul marino", Talle: "4" },
      { Color: "Blanco", Talle: "1" },
      { Color: "Blanco", Talle: "2" },
      { Color: "Blanco", Talle: "3" },
      { Color: "Blanco", Talle: "4" },
    ],
  },
  {
    title: "Remera striped black white",
    description: "Remera a rayas negras y blancas. Corte regular.",
    images: [
      "https://images.unsplash.com/photo-1503342394128-c104d54dba01?w=600&q=80",
      "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&q=80",
    ],
    category: CATEGORIES.remeras,
    price: { ars: 17900 * 100, usd: 85 * 100 },
    productOptions: [
      { title: "Color", values: ["Negro y blanco", "Azul y blanco"] },
      { title: "Talle", values: ["1", "2", "3", "4"] },
    ],
    variantOptions: [
      { Color: "Negro y blanco", Talle: "1" },
      { Color: "Negro y blanco", Talle: "2" },
      { Color: "Negro y blanco", Talle: "3" },
      { Color: "Negro y blanco", Talle: "4" },
      { Color: "Azul y blanco", Talle: "1" },
      { Color: "Azul y blanco", Talle: "2" },
      { Color: "Azul y blanco", Talle: "3" },
      { Color: "Azul y blanco", Talle: "4" },
    ],
  },
  {
    title: "Remera linen ecru",
    description: "Remera de lino color crudo. Ideal para verano.",
    images: [
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&q=80",
      "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=600&q=80",
    ],
    category: CATEGORIES.remeras,
    price: { ars: 22900 * 100, usd: 109 * 100 },
    productOptions: [
      { title: "Color", values: ["Crudo", "Blanco", "Natural"] },
      { title: "Talle", values: ["1", "2", "3", "4"] },
    ],
    variantOptions: [
      { Color: "Crudo", Talle: "1" },
      { Color: "Crudo", Talle: "2" },
      { Color: "Crudo", Talle: "3" },
      { Color: "Crudo", Talle: "4" },
      { Color: "Blanco", Talle: "1" },
      { Color: "Blanco", Talle: "2" },
      { Color: "Blanco", Talle: "3" },
      { Color: "Blanco", Talle: "4" },
      { Color: "Natural", Talle: "1" },
      { Color: "Natural", Talle: "2" },
      { Color: "Natural", Talle: "3" },
      { Color: "Natural", Talle: "4" },
    ],
  },
]
