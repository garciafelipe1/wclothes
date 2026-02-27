"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { getLocalizedPath } from "@/i18n/routing"
import { formatPrice } from "@/lib/format"
import { completeCartAction } from "@/app/actions/checkout/complete-cart"

function IconEnvelope() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 text-neutral-500">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  )
}

function IconPin() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 text-neutral-500">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )
}

function IconTruck() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 text-neutral-500">
      <rect x="1" y="3" width="15" height="13" />
      <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
      <circle cx="5.5" cy="18.5" r="2.5" />
      <circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
  )
}

function IconNote() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 text-neutral-500">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  )
}

function IconMercadoPago() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0">
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
      <line x1="1" y1="10" x2="23" y2="10" />
    </svg>
  )
}

function IconStore() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  )
}

type CheckoutPaymentContentProps = {
  locale: string
  countryCode: string
  email: string
  shippingAddressLine: string
  shippingMethodLabel: string
  shippingCost: number
  currencyCode: string
  total: number
  phone?: string | null
}

export function CheckoutPaymentContent({
  locale,
  countryCode,
  email,
  shippingAddressLine,
  shippingMethodLabel,
  shippingCost,
  currencyCode,
  total,
  phone,
}: CheckoutPaymentContentProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<"mercadopago" | "retiro_local">("mercadopago")
  const addressPath = getLocalizedPath(locale, countryCode, "/checkout/address")
  const confirmacionPath = (orderId: string) =>
    getLocalizedPath(locale, countryCode, "/orders/confirmacion") + `?orderId=${encodeURIComponent(orderId)}`

  const paymentOptions = [
    {
      id: "mercadopago" as const,
      label: "Mercado Pago",
      icon: <IconMercadoPago />,
      badge: "Tarjeta, transferencia o dinero en cuenta",
    },
    {
      id: "retiro_local" as const,
      label: "Retiro en el local",
      sublabel: "Manual Payment — Pagás en persona al retirar",
      icon: <IconStore />,
      badge: `Pagás ${formatPrice(total, currencyCode)} al retirar`,
    },
  ]

  async function handlePlaceOrder() {
    setError(null)
    setLoading(true)
    try {
      const result = await completeCartAction(paymentMethod)
      if (result.success) {
        router.push(confirmacionPath(result.orderId))
        return
      }
      setError(result.error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {error && (
        <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md" role="alert">
          {error}
        </p>
      )}
      {/* Resumen: contacto */}
      <div className="flex items-start justify-between gap-4 py-3 border-b border-neutral-100">
        <div className="flex gap-3 min-w-0">
          <IconEnvelope />
          <div className="min-w-0">
            <p className="text-sm text-neutral-500">Contacto</p>
            <p className="text-sm font-medium text-neutral-900 truncate">{email || "—"}</p>
          </div>
        </div>
        <Link href={addressPath} className="text-sm text-neutral-600 hover:underline shrink-0">
          Cambiar
        </Link>
      </div>

      {/* Resumen: dirección */}
      <div className="flex items-start justify-between gap-4 py-3 border-b border-neutral-100">
        <div className="flex gap-3 min-w-0">
          <IconPin />
          <div className="min-w-0">
            <p className="text-sm text-neutral-500">Dirección de envío</p>
            <p className="text-sm text-neutral-800 whitespace-pre-line">{shippingAddressLine || "—"}</p>
          </div>
        </div>
        <Link href={addressPath} className="text-sm text-neutral-600 hover:underline shrink-0">
          Cambiar
        </Link>
      </div>

      {/* Resumen: método de envío */}
      <div className="flex items-start justify-between gap-4 py-3 border-b border-neutral-100">
        <div className="flex gap-3 min-w-0">
          <IconTruck />
          <div className="min-w-0">
            <p className="text-sm text-neutral-500">Método de envío</p>
            <p className="text-sm text-neutral-800">{shippingMethodLabel}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-sm font-medium text-neutral-900">{formatPrice(shippingCost, currencyCode)}</span>
          <Link href={addressPath} className="text-sm text-neutral-600 hover:underline">
            Cambiar
          </Link>
        </div>
      </div>

      {/* Notas de pedido */}
      <div className="flex items-center justify-between gap-4 py-3 border-b border-neutral-100">
        <div className="flex gap-3 min-w-0">
          <IconNote />
          <p className="text-sm text-neutral-800">Notas de pedido</p>
        </div>
        <button type="button" className="text-sm text-neutral-600 hover:underline shrink-0">
          Agregar
        </button>
      </div>

      {/* MEDIO DE PAGO */}
      <section>
        <h2 className="text-xs font-semibold text-neutral-800 uppercase tracking-wider mb-4">
          Medio de pago
        </h2>
        <div className="space-y-2">
          {paymentOptions.map((opt) => (
            <label
              key={opt.id}
              className="flex items-center justify-between gap-3 w-full p-4 rounded-lg border border-neutral-200 bg-white hover:border-neutral-300 cursor-pointer transition-colors has-[:checked]:border-neutral-800 has-[:checked]:ring-1 has-[:checked]:ring-neutral-800"
            >
              <span className="flex items-center gap-3 min-w-0">
                <input
                  type="radio"
                  name="payment_method"
                  value={opt.id}
                  checked={paymentMethod === opt.id}
                  onChange={() => setPaymentMethod(opt.id)}
                  className="shrink-0"
                />
                <span className="text-neutral-700 shrink-0">{opt.icon}</span>
                <span className="flex flex-col min-w-0">
                  <span className="text-sm font-medium text-neutral-900 truncate">{opt.label}</span>
                  {"sublabel" in opt && opt.sublabel && (
                    <span className="text-xs text-neutral-500">{opt.sublabel}</span>
                  )}
                </span>
              </span>
              {opt.badge && (
                <span className="shrink-0 rounded-full bg-red-600 px-2.5 py-1 text-xs font-medium text-white whitespace-nowrap">
                  {opt.badge}
                </span>
              )}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 text-neutral-400">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </label>
          ))}
        </div>
      </section>

      {/* Guardar datos */}
      <label className="flex items-start gap-3 cursor-pointer">
        <input type="checkbox" name="save_data" defaultChecked className="mt-0.5 rounded border-neutral-300" />
        <span className="text-sm text-neutral-700">Guardar datos para comprar más rápido</span>
      </label>

      {/* SMS */}
      {phone && (
        <p className="text-xs text-neutral-600">
          En las próximas compras enviaremos un código para: {phone}{" "}
          <button type="button" className="text-neutral-600 hover:underline">
            Alterar
          </button>
        </p>
      )}

      {/* Términos */}
      <p className="text-xs text-neutral-500">
        Al guardar, aceptás los{" "}
        <Link href="#" className="text-neutral-600 hover:underline">Términos de uso</Link>
        {" "}y{" "}
        <Link href="#" className="text-neutral-600 hover:underline">Políticas de privacidad</Link>.
      </p>

      {/* Realizar pedido */}
      <div className="pt-4">
        <button
          type="button"
          onClick={handlePlaceOrder}
          disabled={loading}
          className="w-full sm:w-auto min-w-[260px] px-8 py-3.5 bg-[#4a3728] text-white font-medium rounded-md hover:bg-[#3d2e21] transition-colors text-center disabled:opacity-50"
        >
          {loading ? "Procesando..." : "Realizar pedido"}
        </button>
      </div>
    </div>
  )
}
