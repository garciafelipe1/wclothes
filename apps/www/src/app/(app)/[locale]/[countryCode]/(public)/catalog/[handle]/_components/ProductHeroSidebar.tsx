"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useTranslations } from "next-intl"
import { formatPrice } from "@/lib/format"
import { addToCartAction } from "@/app/actions/cart/add-to-cart"
import { useCartDrawer } from "@/app/context/cart-drawer"
import { useRouter } from "next/navigation"

type VariantOption = { id?: string; value?: string; option_id?: string; option?: { id?: string } }

type Variant = {
  id: string
  title?: string
  options?: VariantOption[]
  calculated_price?: { calculated_amount?: number; currency_code?: string }
}

type ProductHeroSidebarProps = {
  product: {
    id: string
    title?: string
    description?: string
    handle?: string
    options?: Array<{ id?: string; title?: string }>
    thumbnail?: string
    images?: Array<{ url?: string }>
  }
  variants: Variant[]
  countryCode: string
  sizeGuidePath?: string
}

function IconHeart({ filled }: { filled?: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  )
}

export function ProductHeroSidebar({
  product,
  variants,
  countryCode,
  sizeGuidePath = "#size-guide",
}: ProductHeroSidebarProps) {
  const t = useTranslations("pdp")
  const tCommon = useTranslations("common")
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(variants[0]?.id ?? null)
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [wishlisted, setWishlisted] = useState(false)
  const { openCart, incrementCartCount } = useCartDrawer()
  const router = useRouter()

  const selectedVariant = variants.find((v) => v.id === selectedVariantId) ?? variants[0]
  const price = selectedVariant?.calculated_price
  const displayPrice = formatPrice(price?.calculated_amount, price?.currency_code)

  const optionGroups = product.options ?? []

  async function handleAddToCart() {
    if (!selectedVariantId) return
    setMessage(null)
    setLoading(true)
    try {
      const result = await addToCartAction({ variantId: selectedVariantId, quantity, countryCode })
      if (result.success) {
        setMessage({ type: "success", text: t("addedToBag") })
        incrementCartCount()
        openCart()
        router.refresh()
      } else {
        setMessage({ type: "error", text: result.error ?? t("addError") })
      }
    } catch (e) {
      setMessage({ type: "error", text: e instanceof Error ? e.message : t("addError") })
    } finally {
      setLoading(false)
    }
  }

  return (
    <aside className="pdp-hero-sidebar">
      <h1 className="pdp-hero-sidebar__title">{product.title ?? tCommon("noTitle")}</h1>
      <p className="pdp-hero-sidebar__price">{displayPrice}</p>
      {product.description && (
        <p className="pdp-hero-sidebar__desc">{product.description}</p>
      )}

      {optionGroups.length > 0 && (
        <div className="pdp-hero-sidebar__options">
          {[...optionGroups]
            .sort((a, b) => {
              const aIsColor = (a.title ?? "").toLowerCase().includes("color") || (a.title ?? "").toLowerCase().includes("colour")
              const bIsColor = (b.title ?? "").toLowerCase().includes("color") || (b.title ?? "").toLowerCase().includes("colour")
              if (aIsColor && !bIsColor) return -1
              if (!aIsColor && bIsColor) return 1
              return 0
            })
            .map((opt) => {
              const optId = opt.id
              const getVal = (o: VariantOption) => ((o.option_id ?? o.option?.id) === optId ? o.value : undefined)
              const values = [...new Set(variants.flatMap((v) => (v.options ?? []).map(getVal).filter((x): x is string => !!x)))]
              if (values.length === 0) return null
              const isSize = (opt.title ?? "").toLowerCase().includes("size") || (opt.title ?? "").toLowerCase().includes("talla") || (opt.title ?? "").toLowerCase().includes("talle")
              const isColor = (opt.title ?? "").toLowerCase().includes("color") || (opt.title ?? "").toLowerCase().includes("colour")
              const selectedVal = selectedVariant?.options?.find((o) => (o.option_id ?? o.option?.id) === opt.id)?.value
              const colorThumbnail = product.thumbnail ?? product.images?.[0]?.url

              return (
                <div key={opt.id ?? opt.title} className={`pdp-hero-sidebar__opt-group ${isColor ? "pdp-hero-sidebar__opt-group--color" : ""} ${isSize ? "pdp-hero-sidebar__opt-group--size" : ""}`}>
                  <div className="pdp-hero-sidebar__opt-head">
                    <span className="pdp-hero-sidebar__opt-label">
                      {isSize ? t("size") : opt.title}
                      {selectedVal && ": "}
                      {selectedVal}
                    </span>
                  </div>
                  {isColor && colorThumbnail && (
                    <div className="pdp-hero-sidebar__color-thumb">
                      <Image
                        src={colorThumbnail}
                        alt=""
                        width={64}
                        height={64}
                        className="pdp-hero-sidebar__color-thumb-img"
                      />
                    </div>
                  )}
                  <div className="pdp-hero-sidebar__opt-values">
                    {values.map((val) => {
                      const variantForVal = variants.find((v) => v.options?.some((o) => o.value === val && (o.option_id ?? o.option?.id) === opt.id))
                      const isSelected = selectedVariantId === variantForVal?.id
                      const isUnavailable = false
                      return (
                        <button
                          key={val}
                          type="button"
                          className={`pdp-hero-sidebar__opt-btn ${isSize ? "pdp-hero-sidebar__opt-btn--square" : ""} ${isSelected ? "pdp-hero-sidebar__opt-btn--active" : ""} ${isUnavailable ? "pdp-hero-sidebar__opt-btn--unavailable" : ""}`}
                          onClick={() => variantForVal && !isUnavailable && setSelectedVariantId(variantForVal.id)}
                          disabled={isUnavailable}
                        >
                          {val}
                        </button>
                      )
                    })}
                  </div>
                  {isSize && (
                    <Link href={sizeGuidePath} className="pdp-hero-sidebar__size-guide-link pdp-hero-sidebar__size-guide-link--below">
                      {t("sizeGuide")}
                    </Link>
                  )}
                </div>
              )
            })}
        </div>
      )}

      {variants.length > 1 && optionGroups.length === 0 && (
        <div className="pdp-hero-sidebar__options">
          <div className="pdp-hero-sidebar__opt-head">
            <span className="pdp-hero-sidebar__opt-label">{t("variant")}</span>
            <Link href={sizeGuidePath} className="pdp-hero-sidebar__size-guide-link">
              {t("sizeGuide")}
            </Link>
          </div>
          <div className="pdp-hero-sidebar__opt-values">
            {variants.map((v) => (
              <button
                key={v.id}
                type="button"
                className={`pdp-hero-sidebar__opt-btn ${selectedVariantId === v.id ? "pdp-hero-sidebar__opt-btn--active" : ""}`}
                onClick={() => setSelectedVariantId(v.id)}
              >
                {v.title ?? "Default"}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="pdp-hero-sidebar__actions">
        <div className="pdp-hero-sidebar__add-row">
          <div className="pdp-hero-sidebar__qty">
            <button
              type="button"
              className="pdp-hero-sidebar__qty-btn"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              aria-label={t("qtyDecrease")}
            >
              −
            </button>
            <span className="pdp-hero-sidebar__qty-val" aria-live="polite">
              {quantity}
            </span>
            <button
              type="button"
              className="pdp-hero-sidebar__qty-btn"
              onClick={() => setQuantity((q) => Math.min(10, q + 1))}
              aria-label={t("qtyIncrease")}
            >
              +
            </button>
          </div>
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={!selectedVariantId || loading}
            className="pdp-hero-sidebar__add-btn"
          >
            {loading ? t("adding") : t("addToBag")}
          </button>
        </div>
        <button
          type="button"
          className="pdp-hero-sidebar__wishlist-btn"
          onClick={() => setWishlisted(!wishlisted)}
          aria-label={wishlisted ? t("removeFromWishlist") : t("addToWishlist")}
          title={t("wishlistHint")}
        >
          <IconHeart filled={wishlisted} />
          <span>{wishlisted ? t("saved") : t("addToWishlist")}</span>
        </button>
        {message && (
          <p className={`pdp-hero-sidebar__msg pdp-hero-sidebar__msg--${message.type}`} role="status">
            {message.text}
          </p>
        )}
      </div>

      <p className="pdp-hero-sidebar__shipping">
        <span className="pdp-hero-sidebar__shipping-icon" aria-hidden>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M13 16V6a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h1m8-1a1 1 0 0 1-1 1H9m4-1V8a1 1 0 0 1 1-1h2.586a1 1 0 0 1 .707.293l3.414 3.414a1 1 0 0 1 .293.707V16a1 1 0 0 1-1 1h-1m-8-1a1 1 0 0 0 1 1h1" />
          </svg>
        </span>
        {t("shippingInfo")}
      </p>
    </aside>
  )
}
