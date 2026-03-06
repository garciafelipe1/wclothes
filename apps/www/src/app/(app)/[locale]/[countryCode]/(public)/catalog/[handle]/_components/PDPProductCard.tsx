"use client"

import Link from "next/link"
import Image from "next/image"
import { formatPrice } from "@/lib/format"
import { useTranslations } from "next-intl"

/** Map common color names to hex for swatch dots (NOCTA-style) */
const COLOR_HEX: Record<string, string> = {
  black: "#1a1a1a",
  white: "#f5f5f4",
  navy: "#1e3a5f",
  blue: "#2563eb",
  "blue (light)": "#93c5fd",
  red: "#b91c1c",
  green: "#166534",
  grey: "#6b7280",
  gray: "#6b7280",
  beige: "#d4b896",
  brown: "#78350f",
  pink: "#db2777",
  "pink (light)": "#f9a8d4",
  "pink (grey)": "#9d4b4b",
  moss: "#4a5d23",
  mineral: "#6b7280",
  cashew: "#c4a77d",
  cream: "#f5f0e6",
  yellow: "#ca8a04",
  purple: "#6b21a8",
  "purple (yellow)": "#6b21a8",
  orange: "#c2410c",
}

function getColorHex(name: string): string | null {
  const key = name.toLowerCase().trim()
  return COLOR_HEX[key] ?? null
}

export type PDPProductCardProduct = {
  id: string
  title?: string
  handle?: string
  thumbnail?: string
  images?: Array<{ url?: string }>
  variants?: Array<{
    calculated_price?: {
      calculated_amount?: number
      original_amount?: number
      currency_code?: string
    }
    options?: Array<{ option_id?: string; value?: string }>
  }>
}

type PDPProductCardProps = {
  product: PDPProductCardProduct
  href: string
}

export function PDPProductCard({ product, href }: PDPProductCardProps) {
  const t = useTranslations("pdp")
  const images = product.images ?? []
  const mainImage = product.thumbnail ?? images[0]?.url
  const hoverImage = images.length > 1 ? images[1]?.url : images.find((i) => i.url !== mainImage)?.url
  const hasHover = hoverImage && hoverImage !== mainImage

  const variant = product.variants?.[0]
  const calcPrice = variant?.calculated_price
  const originalAmount = calcPrice?.original_amount
  const saleAmount = calcPrice?.calculated_amount
  const hasSale = originalAmount != null && saleAmount != null && originalAmount > saleAmount

  const allValues = product.variants?.flatMap((v) => v.options?.map((o) => o.value).filter(Boolean) ?? []) ?? []
  const colorValues = [...new Set(allValues)].filter((v) => v && v !== "Default")
  const hasColors = colorValues.length > 0

  return (
    <Link href={href} className="pdp-card">
      <div className="pdp-card__img-wrap">
        {mainImage && (
          <>
            <Image
              src={mainImage}
              alt={product.title ?? ""}
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className="pdp-card__img pdp-card__img--main"
            />
            {hasHover && (
              <Image
                src={hoverImage}
                alt=""
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                className="pdp-card__img pdp-card__img--hover"
                aria-hidden
              />
            )}
          </>
        )}
      </div>
      <div className="pdp-card__info">
        <h3 className="pdp-card__title">{product.title}</h3>
        <div className="pdp-card__prices">
          {hasSale ? (
            <>
              <span className="pdp-card__price pdp-card__price--original">
                {formatPrice(originalAmount, calcPrice?.currency_code)}
              </span>
              <span className="pdp-card__price pdp-card__price--sale">
                {formatPrice(saleAmount, calcPrice?.currency_code)}
              </span>
            </>
          ) : (
            <span className="pdp-card__price">
              {formatPrice(calcPrice?.calculated_amount, calcPrice?.currency_code)}
            </span>
          )}
        </div>
        {hasColors && (
          <ul className="pdp-card__swatches" aria-label={t("variant")}>
            {colorValues.slice(0, 6).map((c) => {
              const hex = getColorHex(c)
              return (
                <li
                  key={c}
                  className={`pdp-card__swatch ${hex ? "pdp-card__swatch--dot" : "pdp-card__swatch--label"}`}
                  style={hex ? { backgroundColor: hex } : undefined}
                  title={c}
                  aria-label={c}
                >
                  {!hex && <span className="pdp-card__swatch-label">{c}</span>}
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </Link>
  )
}
