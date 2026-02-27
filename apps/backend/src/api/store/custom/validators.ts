import { z } from "zod"
import {
  CATEGORIES,
  sortOptionValues,
} from "../../../shared/constants"

const categoriesList = Object.values(CATEGORIES) as [string, ...string[]]

export const GetStoreCustomSchema = z.object({
  q: z.string().optional(),
  order: z.enum(sortOptionValues as [string, ...string[]]).optional(),
  category: z
    .string()
    .optional()
    .transform((val) =>
      val && categoriesList.includes(val) ? val : undefined
    ),
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
