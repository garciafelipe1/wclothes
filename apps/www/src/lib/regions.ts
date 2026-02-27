import { medusa } from "@/lib/medusa"

export type StoreRegion = {
  id: string
  name?: string
  currency_code?: string
  countries?: Array<{ iso_2?: string }>
}

/**
 * Returns the first region (e.g. Argentina) for pricing and catalog.
 * Caches in memory per request in RSC.
 */
export async function getDefaultRegion(): Promise<StoreRegion | null> {
  try {
    const { regions } = await medusa.store.region.list()
    if (!regions?.length) return null
    const ar = regions.find(
      (r: StoreRegion) =>
        r.countries?.some((c) => c?.iso_2 === "ar")
    )
    return ar ?? regions[0] ?? null
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    console.warn("[getDefaultRegion]", msg)
    return null
  }
}
