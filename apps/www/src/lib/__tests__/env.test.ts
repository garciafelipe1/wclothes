import { describe, it, expect, beforeEach, afterEach } from "vitest"
import { getMedusaBaseUrl, getPublishableKey } from "../env"

const ORIGINAL_ENV = process.env

describe("env", () => {
  beforeEach(() => {
    process.env = { ...ORIGINAL_ENV }
  })

  afterEach(() => {
    process.env = ORIGINAL_ENV
  })

  describe("getMedusaBaseUrl", () => {
    it("returns NEXT_PUBLIC_MEDUSA_BACKEND_URL when set", () => {
      process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL = "https://api.example.com"
      expect(getMedusaBaseUrl()).toBe("https://api.example.com")
    })

    it("returns fallback when NEXT_PUBLIC_MEDUSA_BACKEND_URL is not set", () => {
      delete process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL
      expect(getMedusaBaseUrl()).toBe("http://localhost:9001")
    })

    it("returns fallback when NEXT_PUBLIC_MEDUSA_BACKEND_URL is empty or whitespace", () => {
      process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL = ""
      expect(getMedusaBaseUrl()).toBe("http://localhost:9001")
      process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL = "   "
      expect(getMedusaBaseUrl()).toBe("http://localhost:9001")
    })
  })

  describe("getPublishableKey", () => {
    it("returns key when set", () => {
      process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY = "pk_abc123"
      expect(getPublishableKey()).toBe("pk_abc123")
    })

    it("returns undefined when not set", () => {
      delete process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
      expect(getPublishableKey()).toBeUndefined()
    })
  })
})
