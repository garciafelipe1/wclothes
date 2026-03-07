import { z } from "zod"

export const GetStoreProductSchema = z.object({
  handle: z.string().min(1),
  region_id: z.string().optional(),
  currency_code: z.string().optional(),
})

export type GetStoreProductSchemaType = z.infer<typeof GetStoreProductSchema>
