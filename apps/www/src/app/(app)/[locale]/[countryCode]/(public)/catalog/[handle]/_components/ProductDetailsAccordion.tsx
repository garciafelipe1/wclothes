"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"

type Section = {
  id: string
  titleKey: string
  content: string
}

type ProductDetailsAccordionProps = {
  description?: string
  materials?: string
  fit?: string
  care?: string
}

function CareContent({ text }: { text: string }) {
  const parts = text.split(/\s+(?=(?:Secado|Planchado|Guardado|Drying|Ironing|Storage|For wool|Para prendas)(?:\s[^:]+)?:)/i)
  if (parts.length > 1) {
    return (
      <div className="pdp-details__care-list">
        {parts
          .map((p) => p.trim())
          .filter(Boolean)
          .map((part, i) => {
            const match = part.match(/^([^:]+):\s*([\s\S]*)$/)
            if (match) {
              return (
                <div key={i} className="pdp-details__care-item">
                  <strong className="pdp-details__care-label">{match[1].trim()}:</strong>
                  <span> {match[2].trim()}</span>
                </div>
              )
            }
            return <p key={i} className="pdp-details__care-para">{part}</p>
          })}
      </div>
    )
  }
  return <p>{text}</p>
}

export function ProductDetailsAccordion({
  description = "",
  materials,
  fit,
  care,
}: ProductDetailsAccordionProps) {
  const t = useTranslations("pdp")
  const [openIds, setOpenIds] = useState<Set<string>>(new Set(["description"]))

  const toggle = (id: string) => {
    setOpenIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const sections: Section[] = [
    { id: "description", titleKey: "productDescription", content: description || t("defaultDescription") },
    { id: "materials", titleKey: "materialsFabric", content: materials ?? t("defaultMaterials") },
    { id: "fit", titleKey: "fitSizing", content: fit ?? t("defaultFit") },
    { id: "care", titleKey: "careInstructions", content: care ?? t("defaultCare") },
  ]

  return (
    <div className="pdp-details">
      <h2 className="pdp-details__title">{t("productDetails")}</h2>
      <div className="pdp-details__accordions">
        {sections.map((s) => {
          const isOpen = openIds.has(s.id)
          return (
            <div key={s.id} className="pdp-details__item">
              <button
                type="button"
                className="pdp-details__trigger"
                onClick={() => toggle(s.id)}
                aria-expanded={isOpen}
              >
                <span>{t(s.titleKey)}</span>
                <span className="pdp-details__icon" aria-hidden>
                  <ChevronIcon open={isOpen} />
                </span>
              </button>
              <div className={`pdp-details__content ${isOpen ? "pdp-details__content--open" : ""}`}>
                <div className="pdp-details__content-inner">
                  {s.id === "care" ? (
                    <CareContent text={s.content} />
                  ) : (
                    <p>{s.content}</p>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  )
}
