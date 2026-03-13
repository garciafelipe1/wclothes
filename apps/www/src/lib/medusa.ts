import Medusa from "@medusajs/js-sdk"
import { getMedusaBaseUrl, getPublishableKey } from "./env"

export function getMedusaClient() {
  return new Medusa({
    baseUrl: getMedusaBaseUrl(),
    publishableKey: getPublishableKey() ?? undefined,
  })
}

export const medusa = getMedusaClient()
