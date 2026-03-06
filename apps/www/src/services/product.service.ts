import { medusa } from "@/lib/medusa"
import { getDefaultRegion } from "@/lib/data/regions"

const LIMIT = 12

export type CatalogProductRaw = {
  id: string
  title?: string
  handle?: string
  description?: string
  thumbnail?: string
  images?: Array<{ url?: string }>
  options?: Array<{ id?: string; title?: string }>
  variants?: Array<{
    id?: string
    title?: string
    calculated_price?: {
      calculated_amount?: number
      original_amount?: number
      currency_code?: string
    }
    options?: Array<{ option_id?: string; value?: string; option?: { title?: string } }>
  }>
  metadata?: Record<string, unknown>
}

export type GetCustomResponse = {
  result: CatalogProductRaw[]
  metadata: {
    count?: number
    offset?: number
    limit?: number
    total?: number
  }
}

export type GetAllParams = {
  page?: number
  q?: string
  order?: "price_asc" | "price_desc" | "created_at_asc" | "created_at_desc"
  category?: string
  sale?: boolean
  color?: string
  talle?: string
  min_price?: number
  max_price?: number
  region_id?: string
  currency_code?: string
}

export type GetAllResult = {
  products: CatalogProductRaw[]
  info: { totalPages: number; totalItems: number }
}

export const productService = {
  async getAll(params: GetAllParams = {}): Promise<GetAllResult> {
    const region = await getDefaultRegion()
    const page = params.page ?? 1
    const query: Record<string, string | number | undefined> = {
      page,
      region_id: region?.id ?? "",
      currency_code: region?.currency_code ?? "ars",
    }
    if (params.q?.trim()) query.q = params.q.trim()
    if (params.order) query.order = params.order
    if (params.category) query.category = params.category
    if (params.sale) query.sale = "1"
    if (params.color?.trim()) query.color = params.color.trim()
    if (params.talle?.trim()) query.talle = params.talle.trim()
    if (params.min_price != null) query.min_price = params.min_price
    if (params.max_price != null) query.max_price = params.max_price

    try {
      const data = await medusa.client.fetch<GetCustomResponse>(
        "/store/custom",
        { query }
      )
      const result = data?.result ?? []
      const total = (data?.metadata?.total ?? result.length) as number
      const totalPages = Math.ceil(total / LIMIT) || 1
      return {
        products: result,
        info: { totalItems: total, totalPages },
      }
    } catch (e) {
      console.warn("[productService.getAll]", e)
      return { products: [], info: { totalItems: 0, totalPages: 0 } }
    }
  },

  async getByHandle(handle: string): Promise<CatalogProductRaw | null> {
    const region = await getDefaultRegion()
    try {
      const data = await medusa.client.fetch<{ product: CatalogProductRaw }>(
        "/store/custom/product",
        {
          query: {
            handle,
            region_id: region?.id ?? "",
            currency_code: region?.currency_code ?? "ars",
          },
        }
      )
      return data?.product ?? null
    } catch {
      return null
    }
  },

  async getOne(id: string): Promise<CatalogProductRaw | null> {
    const region = await getDefaultRegion()
    try {
      const { product } = await medusa.store.product.retrieve(id, {
        region_id: region?.id,
      })
      return (product ?? null) as CatalogProductRaw | null
    } catch {
      return null
    }
  },

  async getRelated(excludeId: string, limit = 8): Promise<CatalogProductRaw[]> {
    try {
      const { products } = await medusa.store.product.list({
        limit: limit + 10,
        region_id: (await getDefaultRegion())?.id,
        fields: "id,title,handle,thumbnail,images,variants,*variants.calculated_price,variants.options",
      })
      const filtered = (products ?? []).filter((p) => String((p as { id?: string }).id) !== excludeId)
      return filtered.slice(0, limit) as CatalogProductRaw[]
    } catch {
      return []
    }
  },
}
