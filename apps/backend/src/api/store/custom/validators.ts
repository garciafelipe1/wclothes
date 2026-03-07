import { z } from "zod"

const SORT_OPTIONS = ["price_asc", "price_desc", "created_at_desc", "created_at_asc"] as const
const CATEGORY_OPTIONS = ["Calzado", "Remeras"] as const

export const GetStoreCustomSchema = z.object({
  q: z.string().optional(),
  order: z.enum(SORT_OPTIONS).optional(),
  category: z
    .string()
    .optional()
    .transform((val) =>
      val && (CATEGORY_OPTIONS as readonly string[]).includes(val) ? val : undefined
    ),
  sale: z
    .string()
    .optional()
    .transform((val) => val === "1" || val === "true"),
  color: z.string().optional().transform((v) => (v?.trim() || undefined)),
  talle: z.string().optional().transform((v) => (v?.trim() || undefined)),
  min_price: z.preprocess((val) => {
    if (val != null && typeof val === "string") return parseInt(val, 10)
    return val
  }, z.number().optional()),
  max_price: z.preprocess((val) => {
    if (val != null && typeof val === "string") return parseInt(val, 10)
    return val
  }, z.number().optional()),
  page: z.preprocess((val) => {
    if (val != null && typeof val === "string") return parseInt(val, 10)
    return val
  }, z.number().min(1).optional()),
  currency_code: z.string().optional(),
  region_id: z.string().optional(),
})

export type GetStoreCustomSchemaType = z.infer<typeof GetStoreCustomSchema>
