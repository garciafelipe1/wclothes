import Link from "next/link"
import { getLocalizedPath } from "@/i18n/routing"
import { formatPrice } from "@/lib/format"
import { getOrderById } from "@/services/order.service"

type OrderDetailPageProps = {
  params: Promise<{ locale: string; countryCode: string; orderId: string }>
}

function formatAddress(addr: { address_1?: string; postal_code?: string; city?: string; province?: string; phone?: string } | null): string {
  if (!addr) return "—"
  const parts: string[] = []
  if (addr.address_1) parts.push(addr.address_1)
  if (addr.postal_code) parts.push(`CP ${addr.postal_code}`)
  const cityProv = [addr.city, addr.province].filter(Boolean).join(", ")
  if (cityProv) parts.push(addr.phone ? `${cityProv} - ${addr.phone}` : cityProv)
  return parts.length ? parts.join("\n") : "—"
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { locale, countryCode, orderId } = await params
  const order = await getOrderById(orderId)
  const homePath = getLocalizedPath(locale, countryCode, "/")
  const ordersListPath = getLocalizedPath(locale, countryCode, "/orders")

  if (!order) {
    return (
      <div className="checkout-light-theme min-h-screen bg-white text-neutral-900">
        <div className="max-w-2xl mx-auto px-4 py-12">
          <h1 className="text-xl font-semibold mb-4">Pedido no encontrado</h1>
          <p className="text-neutral-600 mb-6">No existe un pedido con ese identificador o no tenés acceso.</p>
          <Link href={ordersListPath} className="text-sm text-neutral-600 underline">
            Ver mis pedidos
          </Link>
        </div>
      </div>
    )
  }

  const items = order.items ?? []
  const summary = order.summary ?? {}
  const total = summary.total ?? order.total ?? 0
  const subtotal = summary.subtotal ?? order.subtotal ?? 0
  const shippingTotal = summary.shipping_total ?? order.shipping_total ?? 0
  const currencyCode = order.currency_code ?? "ars"
  const displayId = order.display_id ?? order.id
  const status = order.status ?? "—"
  const paymentStatus = order.payment_status ?? "—"
  const fulfillmentStatus = order.fulfillment_status ?? "—"
  const createdAt = order.created_at ? new Date(order.created_at).toLocaleDateString(locale, { dateStyle: "long" }) : "—"

  return (
    <div className="checkout-light-theme min-h-screen bg-white text-neutral-900">
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <h1 className="text-xl font-semibold">Pedido #{displayId}</h1>
          <Link href={ordersListPath} className="text-sm text-neutral-600 hover:underline">
            ← Ver todos los pedidos
          </Link>
        </div>

        <div className="rounded-lg border border-neutral-200 bg-neutral-50/50 p-4 mb-6">
          <p className="text-sm text-neutral-600">
            <span className="font-medium text-neutral-800">Fecha:</span> {createdAt}
          </p>
          <p className="text-sm text-neutral-600 mt-1">
            <span className="font-medium text-neutral-800">Estado:</span> {status}
          </p>
          <p className="text-sm text-neutral-600">
            <span className="font-medium text-neutral-800">Pago:</span> {paymentStatus}
          </p>
          <p className="text-sm text-neutral-600">
            <span className="font-medium text-neutral-800">Envío:</span> {fulfillmentStatus}
          </p>
          {order.email && (
            <p className="text-sm text-neutral-600 mt-1">
              <span className="font-medium text-neutral-800">Email:</span> {order.email}
            </p>
          )}
        </div>

        {order.shipping_address && (
          <section className="mb-6">
            <h2 className="text-xs font-semibold text-neutral-800 uppercase tracking-wider mb-2">Dirección de envío</h2>
            <p className="text-sm text-neutral-800 whitespace-pre-line">{formatAddress(order.shipping_address)}</p>
          </section>
        )}

        <section className="mb-6">
          <h2 className="text-xs font-semibold text-neutral-800 uppercase tracking-wider mb-3">Productos</h2>
          <ul className="space-y-3 border border-neutral-200 rounded-lg divide-y divide-neutral-100 overflow-hidden bg-white">
            {Array.isArray(items) && items.length > 0 ? (
              items.map((item: { id: string; title?: string; quantity?: number; unit_price?: number; total?: number; thumbnail?: string; variant?: { title?: string } }) => (
                <li key={item.id} className="flex gap-3 p-4">
                  <div className="w-16 h-16 shrink-0 rounded-md overflow-hidden bg-neutral-100">
                    {item.thumbnail ? (
                      <img src={item.thumbnail} alt={item.title ?? ""} className="w-full h-full object-cover" width={64} height={64} />
                    ) : (
                      <span className="w-full h-full flex items-center justify-center text-neutral-400 text-xs">—</span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-neutral-900">{item.title ?? "Producto"}</p>
                    {item.variant?.title && <p className="text-xs text-neutral-500">{item.variant.title}</p>}
                    <p className="text-sm text-neutral-600">Cantidad: {item.quantity ?? 1}</p>
                  </div>
                  <p className="text-sm font-medium text-neutral-900 shrink-0">
                    {formatPrice(item.total ?? item.unit_price ?? 0, currencyCode)}
                  </p>
                </li>
              ))
            ) : (
              <li className="p-4 text-sm text-neutral-500">Sin ítems</li>
            )}
          </ul>
        </section>

        <div className="border border-neutral-200 rounded-lg p-4 bg-white space-y-2 text-sm">
          <div className="flex justify-between text-neutral-700">
            <span>Subtotal</span>
            <span>{formatPrice(subtotal, currencyCode)}</span>
          </div>
          <div className="flex justify-between text-neutral-700">
            <span>Envío</span>
            <span>{formatPrice(shippingTotal, currencyCode)}</span>
          </div>
          <div className="flex justify-between font-semibold text-base pt-2 border-t border-neutral-200">
            <span>Total</span>
            <span>{formatPrice(total, currencyCode)}</span>
          </div>
        </div>

        <p className="mt-6">
          <Link href={homePath} className="text-sm text-neutral-600 hover:underline">
            Seguir comprando
          </Link>
        </p>
      </div>
    </div>
  )
}
