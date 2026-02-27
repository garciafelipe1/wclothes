import Link from "next/link"
import { getLocalizedPath } from "@/i18n/routing"

type Step = "cart" | "delivery" | "payment"

type CheckoutProgressProps = {
  locale: string
  countryCode: string
  currentStep: Step
}

const STEPS: { id: Step; label: string; path: string }[] = [
  { id: "cart", label: "Carrito", path: "/" },
  { id: "delivery", label: "Entrega", path: "/checkout/address" },
  { id: "payment", label: "Pago", path: "/checkout/shipping" },
]

function IconCheck({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

function IconTruck({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="3" width="15" height="13" />
      <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
      <circle cx="5.5" cy="18.5" r="2.5" />
      <circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
  )
}

function IconCard({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
      <line x1="1" y1="10" x2="23" y2="10" />
    </svg>
  )
}

function IconCart({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  )
}

export function CheckoutProgress({
  locale,
  countryCode,
  currentStep,
}: CheckoutProgressProps) {
  const currentIndex = STEPS.findIndex((s) => s.id === currentStep)

  return (
    <nav aria-label="Progreso del checkout" className="flex items-start justify-between w-full mb-10">
      {STEPS.map((step, i) => {
        const isPast = i < currentIndex
        const isCurrent = step.id === currentStep
        const path = getLocalizedPath(locale, countryCode, step.path)
        const isCart = step.id === "cart"
        const isCompleted = isPast || (isCart && currentIndex > 0)
        const lineLeft = i > 0
        const lineRight = i < STEPS.length - 1
        const lineLeftActive = isPast || isCurrent
        const lineRightActive = isPast

        return (
          <div key={step.id} className="flex flex-col items-center flex-1">
            <div className="flex items-center w-full">
              {lineLeft && (
                <div
                  className={`h-0.5 flex-1 ${lineLeftActive ? "bg-neutral-800" : "bg-neutral-200"}`}
                  aria-hidden
                />
              )}
              <div className="flex shrink-0">
                {isCompleted ? (
                  <span className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-neutral-300 bg-neutral-100 text-neutral-600">
                    <IconCheck className="text-neutral-600" />
                  </span>
                ) : (
                  <span
                    className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                      isCurrent ? "border-neutral-800 bg-white text-neutral-800" : "border-neutral-200 bg-neutral-50 text-neutral-400"
                    }`}
                  >
                    {step.id === "cart" && <IconCart />}
                    {step.id === "delivery" && <IconTruck />}
                    {step.id === "payment" && <IconCard />}
                  </span>
                )}
              </div>
              {lineRight && (
                <div
                  className={`h-0.5 flex-1 ${lineRightActive ? "bg-neutral-800" : "bg-neutral-200"}`}
                  aria-hidden
                />
              )}
            </div>
            <span
              className={`mt-2 text-xs font-medium ${
                isCurrent ? "text-neutral-900" : isCompleted ? "text-neutral-600" : "text-neutral-400"
              }`}
            >
              {isCurrent ? step.label : isCompleted ? (
                <Link href={path} className="hover:underline">
                  {step.label}
                </Link>
              ) : (
                step.label
              )}
            </span>
          </div>
        )
      })}
    </nav>
  )
}
