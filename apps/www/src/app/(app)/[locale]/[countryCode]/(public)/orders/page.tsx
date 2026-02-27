import Link from "next/link"
import { getLocalizedPath } from "@/i18n/routing"
import { formatPrice } from "@/lib/format"
import { getOrdersByEmail } from "@/services/order.service"

type OrdersPageProps = {
  params: Promise<{ locale: string; countryCode: string }>
  searchParams: Promise<{ email?: string }>
}

export default async function OrdersPage({ params, searchParams }: OrdersPageProps) {
  const { locale, countryCode } = await params
  const { email: emailParam } = await searchParams
  const homePath = getLocalizedPath(locale, countryCode, "/")
  const ordersPath = getLocalizedPath(locale, countryCode, "/orders")
  const orders = emailParam ? await getOrdersByEmail(emailParam) : []

  return (
    <div className="checkout-light-theme min-h-screen bg-white text-neutral-900">
      <div className="max-w-2xl mx-auto px-4 py-10">
        <h1 className="text-xl font-semibold mb-2">Mis pedidos</h1>
        <p className="text-sm text-neutral-600 mb-6">
          Ingresá el email que usaste en el checkout para ver tus pedidos.
        </p>

        <form method="get" action={ordersPath} className="flex flex-wrap gap-2 mb-6">
          <input
            type="email"
            name="email"
            placeholder="tu@email.com"
            defaultValue={emailParam ?? ""}
            className="flex-1 min-w-[200px] border border-neutral-200 rounded-md px-3 py-2 text-neutral-900 bg-white focus:border-neutral-400 focus:outline-none"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-[#4a3728] text-white text-sm font-medium rounded-md hover:bg-[#3d2e21]"
          >
            Ver pedidos
          </button>
        </form>

        {orders.length > 0 && (
          <ul className="mt-8 space-y-4">
            {orders.map((order: { id: string; display_id?: number; created_at?: string; total?: number; currency_code?: string; status?: string }) => (
              <li key={order.id} className="border border-neutral-200 rounded-lg p-4 hover:border-neutral-300">
                <Link href={getLocalizedPath(locale, countryCode, `/orders/${order.id}`)} className="block">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-medium text-neutral-900">
                      Pedido #{order.display_id ?? order.id}
                    </span>
                    <span className="text-sm text-neutral-600">
                      {order.created_at
                        ? new Date(order.created_at).toLocaleDateString(locale, { dateStyle: "medium" })
                        : "—"}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-2 mt-1">
                    <span className="text-sm text-neutral-600">{order.status ?? "—"}</span>
                    <span className="text-sm font-medium text-neutral-900">
                      {formatPrice(order.total ?? 0, order.currency_code ?? "ars")}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}

        {emailParam && orders.length === 0 && (
          <p className="mt-6 text-sm text-neutral-600">
            No encontramos pedidos con ese email.
          </p>
        )}

        <p className="mt-8">
          <Link href={homePath} className="text-sm text-neutral-600 hover:underline">
            Volver al inicio
          </Link>
        </p>
      </div>
    </div>
  )
}
