/**
 * GET /store/custom/product — Producto por handle con options y variants.options
 * Query: handle, region_id, currency_code
 */
import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import {
  ContainerRegistrationKeys,
  QueryContext,
} from "@medusajs/framework/utils"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const handle = req.query && req.query.handle != null ? String(req.query.handle).trim() : ""
  const region_id = req.query && req.query.region_id != null ? String(req.query.region_id) : ""
  const currency_code = req.query && req.query.currency_code != null ? String(req.query.currency_code) : "ars"

  if (!handle) {
    res.status(400).json({ error: "handle is required" })
    return
  }

  const { data } = await query.graph({
    entity: "product",
    fields: [
      "id",
      "title",
      "handle",
      "description",
      "thumbnail",
      "images.url",
      "metadata",
      "options.id",
      "options.title",
      "variants.id",
      "variants.title",
      "variants.calculated_price.calculated_amount",
      "variants.calculated_price.original_amount",
      "variants.calculated_price.currency_code",
      "variants.options.id",
      "variants.options.value",
      "variants.options.option_id",
    ],
    filters: { handle },
    context: {
      variants: {
        calculated_price: QueryContext({
          region_id: region_id || undefined,
          currency_code,
        }),
      },
    },
  })

  const raw = Array.isArray(data) ? data[0] : null
  if (!raw) {
    res.status(404).json({ error: "Product not found" })
    return
  }

  const product = raw as {
    id?: string
    title?: string
    handle?: string
    description?: string
    thumbnail?: string
    images?: Array<{ url?: string }>
    metadata?: Record<string, unknown>
    options?: Array<{ id?: string; title?: string }>
    variants?: Array<{
      id?: string
      title?: string
      calculated_price?: { calculated_amount?: number; original_amount?: number; currency_code?: string }
      options?: Array<{ id?: string; value?: string; option_id?: string }>
    }>
  }

  const options = (product.options != null ? product.options : []).map((o) => ({
    id: o.id,
    title: o.title,
  }))
  const variants = (product.variants != null ? product.variants : []).map((v) => ({
    id: v.id,
    title: v.title,
    calculated_price: v.calculated_price,
    options: (v.options != null ? v.options : []).map((vo) => ({
      option_id: vo.option_id,
      value: vo.value,
    })),
  }))

  res.json({
    product: {
      id: product.id,
      title: product.title,
      handle: product.handle,
      description: product.description,
      thumbnail: product.thumbnail,
      images: product.images,
      metadata: product.metadata,
      options,
      variants,
    },
  })
}
