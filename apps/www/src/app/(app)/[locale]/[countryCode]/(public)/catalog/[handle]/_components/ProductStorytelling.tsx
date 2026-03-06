"use client"

import Image from "next/image"
import { useTranslations } from "next-intl"

type ProductStorytellingProps = {
  images?: Array<{ url?: string }>
  title?: string
}

export function ProductStorytelling({ images = [], title }: ProductStorytellingProps) {
  const t = useTranslations("pdp")
  const urls = (images ?? []).filter((i) => i?.url).map((i) => i.url!)
  if (urls.length < 2) return null

  return (
    <section className="pdp-storytelling" aria-label={t("productDetailsAria")}>
      <div className="pdp-storytelling__grid">
        {urls.slice(0, 4).map((url, i) => (
          <div key={url + i} className="pdp-storytelling__cell">
            <Image
              src={url}
              alt={title ? `${title} - detalle ${i + 1}` : `Detalle ${i + 1}`}
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className="pdp-storytelling__img"
            />
          </div>
        ))}
      </div>
    </section>
  )
}
