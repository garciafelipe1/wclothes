import { formatPrice } from "@/lib/format"

type CartItem = {
  id: string
  title?: string
  quantity?: number
  thumbnail?: string | null
  unit_price?: number
  total?: number
  variant?: { title?: string } | null
  variant_title?: string | null
}

type CheckoutOrderSummaryProps = {
  items: CartItem[]
  currencyCode: string
  subtotal: number
  shippingTotal?: number
  total: number
  /** Opcional: subtotal sin impuestos para mostrar "Precio sin impuestos" */
  subtotalWithoutTax?: number
}

export function CheckoutOrderSummary({
  items,
  currencyCode,
  subtotal,
  shippingTotal = 0,
  total,
  subtotalWithoutTax,
}: CheckoutOrderSummaryProps) {
  return (
    <div className="bg-white rounded-lg border border-neutral-200 p-5 shadow-sm">
      <p className="text-xs text-neutral-500 mb-4">Ver detalles de mi compra</p>

      <ul className="space-y-4 mb-5 pb-5 border-b border-neutral-100">
        {items.map((item) => (
          <li key={item.id} className="flex gap-3">
            <div className="w-16 h-16 shrink-0 rounded-md overflow-hidden bg-neutral-100 border border-neutral-100">
              {item.thumbnail ? (
                <img
                  src={item.thumbnail}
                  alt={item.title ?? ""}
                  className="w-full h-full object-cover"
                  width={64}
                  height={64}
                />
              ) : (
                <span className="w-full h-full flex items-center justify-center text-neutral-400 text-xs">—</span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-neutral-800 leading-snug">
                {item.title ?? "Producto"}
                {(item.variant?.title ?? item.variant_title) ? ` (${item.variant?.title ?? item.variant_title})` : ""} × {item.quantity ?? 1}
              </p>
              <p className="text-sm font-medium text-neutral-900 mt-0.5">
                {formatPrice(item.total ?? item.unit_price ?? 0, currencyCode)}
              </p>
            </div>
          </li>
        ))}
      </ul>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between text-neutral-700">
          <span>Subtotal</span>
          <span>{formatPrice(subtotal, currencyCode)}</span>
        </div>
        {subtotalWithoutTax != null && subtotalWithoutTax !== subtotal && (
          <div className="flex justify-between text-xs text-neutral-500">
            <span>Precio sin impuestos</span>
            <span>{formatPrice(subtotalWithoutTax, currencyCode)}</span>
          </div>
        )}
        <div className="flex justify-between text-neutral-600">
          <span>Costo de envío</span>
          <span>
            {shippingTotal > 0 ? formatPrice(shippingTotal, currencyCode) : "Se calcula después"}
          </span>
        </div>
        <div className="flex justify-between items-baseline pt-3 mt-3 border-t border-neutral-200">
          <span className="font-semibold text-base text-neutral-900">Total</span>
          <span className="font-semibold text-lg text-neutral-900">
            {formatPrice(total, currencyCode)}
          </span>
        </div>
      </div>

      <button
        type="button"
        className="mt-4 w-full text-left text-sm text-neutral-600 hover:underline focus:outline-none"
      >
        Agregar cupón de descuento
      </button>
    </div>
  )
}
