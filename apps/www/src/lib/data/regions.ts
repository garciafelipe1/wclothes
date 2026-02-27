import { medusa } from "@/lib/medusa"

export type StoreRegion = {
  id: string
  name?: string
  currency_code?: string
  countries?: Array<{ iso_2?: string }>
}

export async function listRegions(): Promise<StoreRegion[]> {
  try {
    const { regions } = await medusa.store.region.list()
    return regions ?? []
  } catch (e) {
    console.warn("[listRegions]", e)
    return []
  }
}

/** Obtiene la región de Medusa para un país (iso_2: ar, us, etc.) */
export async function getRegionByCountryCode(countryCode: string): Promise<StoreRegion | null> {
  const regions = await listRegions()
  const lower = countryCode.toLowerCase()
  const found = regions.find((r: StoreRegion) =>
    r.countries?.some((c) => c?.iso_2?.toLowerCase() === lower)
  )
  return found ?? regions[0] ?? null
}
