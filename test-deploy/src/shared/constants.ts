export const CATEGORIES = {
  calzado: "Calzado",
  remeras: "Remeras",
  catalog: "Catálogo",
} as const

export const sortOptions = [
  { label: "Precio: menor a mayor", value: "price_asc" },
  { label: "Precio: mayor a menor", value: "price_desc" },
  { label: "Nuevos primero", value: "created_at_desc" },
  { label: "Antiguos primero", value: "created_at_asc" },
] as const

export const sortOptionValues = sortOptions.map(
  (o) => o.value
) as (typeof sortOptions)[number]["value"][]
