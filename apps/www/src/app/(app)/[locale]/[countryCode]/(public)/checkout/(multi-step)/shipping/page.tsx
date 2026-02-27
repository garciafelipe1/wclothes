import Link from "next/link"
import { getLocalizedPath } from "@/i18n/routing"
import { getCartId } from "@/lib/data/cookies"
import { getCartWithItems } from "@/services/cart.service"
import { OpenCartLink } from "@/components/cart/OpenCartLink"
import { CheckoutProgress } from "../_components/CheckoutProgress"
import { CheckoutOrderSummary } from "../_components/CheckoutOrderSummary"
import { CheckoutPaymentContent } from "./_components/CheckoutPaymentContent"

function formatShippingAddress(addr: Record<string, unknown>): string {
  if (!addr) return ""
  const parts: string[] = []
  if (addr.address_1) parts.push(addr.address_1)
  if (addr.postal_code) parts.push(`CP ${addr.postal_code}`)
  const cityProv = [addr.city, addr.province].filter(Boolean).join(", ")
  const lastLine = addr.phone ? `${cityProv} - ${addr.phone}` : cityProv
  if (lastLine) parts.push(lastLine)
  return parts.filter(Boolean).join("\n")
}

type ShippingPageProps = {
  params: Promise<{ locale: string; countryCode: string }>
}

export default async function ShippingPage({ params }: ShippingPageProps) {
  const { locale, countryCode } = await params
  const addressPath = getLocalizedPath(locale, countryCode, "/checkout/address")

  const cartId = await getCartId()
  const cart = await getCartWithItems(cartId)
  const items = cart?.items ?? []
  const hasItems = Array.isArray(items) && items.length > 0
  const currencyCode = cart?.currency_code ?? "ars"
  const subtotal = cart?.subtotal ?? cart?.item_subtotal ?? cart?.total ?? 0
  const shippingTotal = cart?.shipping_total ?? 0
  const total = cart?.total ?? subtotal
  const email = (cart?.email as string) ?? ""
  const shippingAddress = cart?.shipping_address
  const shippingAddressLine = formatShippingAddress(shippingAddress)
  const shippingMethodLabel = "Envío a domicilio"
  const phone = shippingAddress?.phone ?? cart?.shipping_address?.phone

  return (
    <div>
      <CheckoutProgress
        locale={locale}
        countryCode={countryCode}
        currentStep="payment"
      />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,340px] gap-8 lg:gap-10">
        <div className="min-w-0">
          {!hasItems ? (
            <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-5 text-sm text-neutral-600">
              No hay ítems en el carrito.{" "}
              <a href={addressPath} className="underline">
                Volver a dirección
              </a>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap gap-3 pb-4">
                <Link href={addressPath} className="text-sm text-neutral-600 hover:underline">
                  Volver a dirección
                </Link>
                <OpenCartLink className="text-sm text-neutral-600 hover:underline">
                  Volver al carrito
                </OpenCartLink>
              </div>
              <CheckoutPaymentContent
              locale={locale}
              countryCode={countryCode}
              email={email}
              shippingAddressLine={shippingAddressLine}
              shippingMethodLabel={shippingMethodLabel}
              shippingCost={shippingTotal}
              currencyCode={currencyCode}
              total={total}
              phone={phone}
            />
            </>
          )}
        </div>
        <div className="lg:sticky lg:top-24 h-fit">
          {hasItems ? (
            <CheckoutOrderSummary
              items={items}
              currencyCode={currencyCode}
              subtotal={subtotal}
              shippingTotal={shippingTotal}
              total={total}
            />
          ) : (
            <div className="bg-white rounded-lg border border-neutral-200 p-5 shadow-sm text-sm text-neutral-500">
              No hay ítems en el carrito.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
