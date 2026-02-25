import Medusa from "@medusajs/js-sdk"

const baseUrl =
  typeof window !== "undefined"
    ? (process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9001")
    : process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9001"

const publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY

export function getMedusaClient() {
  return new Medusa({ baseUrl, publishableKey: publishableKey || undefined })
}

export const medusa = getMedusaClient()
