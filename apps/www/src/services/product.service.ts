import { medusa } from "@/lib/medusa"
import { getDefaultRegion } from "@/lib/regions"

const LIMIT = 12

export type CatalogProductRaw = {
  id: string
  title?: string
  handle?: string
  thumbnail?: string
  images?: Array<{ url?: string }>
  variants?: Array<{
    calculated_price?: { calculated_amount?: number; currency_code?: string }
  }>
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
      const { products } = await medusa.store.product.list({
        handle,
        region_id: region?.id,
        fields: "id,title,handle,description,thumbnail,images,variants,variants.calculated_price,categories",
      })
      return (products?.[0] ?? null) as CatalogProductRaw | null
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
}
