import Link from "next/link"
import { getLocalizedPath } from "@/i18n/routing"
import { formatPrice } from "@/lib/format"
import { getOrderById } from "@/services/order.service"

type ConfirmacionPageProps = {
  params: Promise<{ locale: string; countryCode: string }>
  searchParams: Promise<{ orderId?: string }>
}

export default async function OrderConfirmacionPage({ params, searchParams }: ConfirmacionPageProps) {
  const { locale, countryCode } = await params
  const { orderId } = await searchParams
  const homePath = getLocalizedPath(locale, countryCode, "/")
  const ordersListPath = getLocalizedPath(locale, countryCode, "/orders")

  const order = orderId ? await getOrderById(orderId) : null
  const displayId = order?.display_id ?? order?.id ?? null
  const summary = order?.summary as { total?: number } | undefined
  const total = order?.total ?? summary?.total ?? 0
  const currencyCode = order?.currency_code ?? "ars"
  const email = order?.email ?? ""

  return (
    <div className="checkout-light-theme min-h-screen bg-white text-neutral-900 flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md text-center">
        {/* Ícono de éxito */}
        <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-6" aria-hidden>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-green-600">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        <h1 className="text-2xl font-semibold text-neutral-900 mb-2">
          ¡Pedido realizado!
        </h1>
        <p className="text-neutral-600 mb-6">
          Gracias por tu compra. Tu pedido fue confirmado.
        </p>

        {displayId != null && (
          <div className="rounded-xl border border-neutral-200 bg-neutral-50/80 px-6 py-4 mb-8">
            <p className="text-sm text-neutral-500 mb-0.5">Número de pedido</p>
            <p className="text-xl font-semibold text-neutral-900">#{displayId}</p>
            {total > 0 && (
              <p className="text-sm text-neutral-600 mt-2">
                Total: {formatPrice(total, currencyCode)}
              </p>
            )}
            {email && (
              <p className="text-xs text-neutral-500 mt-2">
                Enviamos la confirmación a <span className="text-neutral-700">{email}</span>
              </p>
            )}
          </div>
        )}

        <div className="flex flex-col sm:flex-row flex-wrap gap-3 justify-center items-stretch sm:items-center w-full sm:w-auto">
          <Link
            href={homePath}
            className="inline-flex items-center justify-center w-full sm:w-auto sm:min-w-[200px] px-6 py-3.5 rounded-lg text-sm font-medium whitespace-nowrap border-2 border-neutral-200 text-neutral-800 bg-white hover:border-neutral-300 hover:bg-neutral-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:ring-offset-2"
          >
            Seguir comprando
          </Link>
          {orderId && (
            <Link
              href={getLocalizedPath(locale, countryCode, `/orders/${orderId}`)}
              className="inline-flex items-center justify-center w-full sm:w-auto sm:min-w-[200px] px-6 py-3.5 rounded-lg text-sm font-medium whitespace-nowrap border-2 border-neutral-200 text-neutral-800 bg-white hover:border-neutral-300 hover:bg-neutral-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:ring-offset-2"
            >
              Ver detalle del pedido
            </Link>
          )}
          <Link
            href={ordersListPath}
            className="inline-flex items-center justify-center w-full sm:w-auto sm:min-w-[200px] px-6 py-3.5 rounded-lg text-sm font-medium whitespace-nowrap text-neutral-600 bg-transparent hover:bg-neutral-100 hover:text-neutral-900 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-neutral-300 focus:ring-offset-2"
          >
            Ver todos mis pedidos
          </Link>
        </div>
      </div>
    </div>
  )
}
