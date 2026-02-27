/**
 * GET /store/custom — Catálogo con filtros, orden y paginación.
 * Query: q, category, order, page, region_id, currency_code, min_price, max_price.
 */
import { getLowestPrice } from "@/lib/get-lowest-price"
import type { ProductWithCalculatedPrice } from "@/lib/get-lowest-price"
import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import {
  ContainerRegistrationKeys,
  QueryContext,
} from "@medusajs/framework/utils"
import type { GetStoreCustomSchemaType } from "./validators"

const DEFAULT_LIMIT = 12

function getDateSort(order: GetStoreCustomSchemaType["order"]) {
  if (!order || order === "price_asc" || order === "price_desc") return {}
  return {
    created_at: order === "created_at_desc" ? "DESC" as const : "ASC" as const,
  }
}

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const params = (req.validatedQuery ?? req.query) as GetStoreCustomSchemaType

  const region_id = params.region_id ?? ""
  const currency_code = params.currency_code ?? "ars"

  const filterByTitle =
    params.q && params.q.trim()
      ? { title: { $ilike: `%${params.q.trim()}%` } }
      : {}

  const orderByDate = getDateSort(params.order)

  const needsManual =
    params.order === "price_asc" ||
    params.order === "price_desc" ||
    !!params.category ||
    params.min_price != null ||
    params.max_price != null

  const { data, metadata } = await query.graph({
    entity: "product",
    fields: [
      "id",
      "title",
      "handle",
      "description",
      "thumbnail",
      "categories.name",
      "variants.id",
      "variants.calculated_price.calculated_amount",
      "images.url",
      "metadata",
    ],
    filters: filterByTitle,
    pagination: needsManual
      ? undefined
      : {
          take: DEFAULT_LIMIT,
          skip: ((params.page ?? 1) - 1) * DEFAULT_LIMIT,
          order: orderByDate,
        },
    context: {
      variants: {
        calculated_price: QueryContext({
          region_id: region_id || undefined,
          currency_code,
        }),
      },
    },
  })

  let result = Array.isArray(data) ? [...data] : []

  if (params.category) {
    result = result.filter((p: { categories?: Array<{ name?: string }> }) =>
      p.categories?.some((c) => c?.name === params.category)
    )
  }

  if (params.min_price != null || params.max_price != null) {
    result = result.filter((p: ProductWithCalculatedPrice) => {
      const price = getLowestPrice(p)
      if (params.min_price != null && price < params.min_price) return false
      if (params.max_price != null && price > params.max_price) return false
      return true
    })
  }

  if (params.order === "price_asc" || params.order === "price_desc") {
    result = [...result].sort((a: ProductWithCalculatedPrice, b: ProductWithCalculatedPrice) => {
      const pa = getLowestPrice(a)
      const pb = getLowestPrice(b)
      return params.order === "price_asc" ? pa - pb : pb - pa
    })
  }

  let outMetadata = metadata
  let totalCount: number | undefined
  if (!outMetadata) {
    const page = (params.page ?? 1) - 1
    const skip = page * DEFAULT_LIMIT
    totalCount = result.length
    const slice = result.slice(skip, skip + DEFAULT_LIMIT)
    outMetadata = {
      count: slice.length,
      skip,
      take: DEFAULT_LIMIT,
    }
    result = slice
  }

  const responseMetadata = { ...outMetadata, ...(totalCount !== undefined && { total: totalCount }) }
  res.json({ result, metadata: responseMetadata })
}
