/**
 * Single source of truth for storefront env (Clean Code: DRY).
 * Used by medusa client, order redirect, catalog, etc.
 */
const FALLBACK_BACKEND_URL = "http://localhost:9001"

export function getMedusaBaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL?.trim()
  return url ? url : FALLBACK_BACKEND_URL
}

export function getPublishableKey(): string | undefined {
  return process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
}
