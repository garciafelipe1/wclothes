import { getLocalizedPath } from "@/i18n/routing"
import { getCartId } from "@/lib/data/cookies"
import { getCartWithItems } from "@/services/cart.service"
import { CheckoutProgress } from "../_components/CheckoutProgress"
import { CheckoutOrderSummary } from "../_components/CheckoutOrderSummary"
import { CheckoutAddressForm } from "./_components/CheckoutAddressForm"

type AddressPageProps = {
  params: Promise<{ locale: string; countryCode: string }>
}

export default async function AddressPage({ params }: AddressPageProps) {
  const { locale, countryCode } = await params
  const nextStepPath = getLocalizedPath(locale, countryCode, "/checkout/shipping")

  const cartId = await getCartId()
  const cart = await getCartWithItems(cartId)
  const items = cart?.items ?? []
  const hasItems = Array.isArray(items) && items.length > 0
  const currencyCode = cart?.currency_code ?? "ars"
  const subtotal = cart?.subtotal ?? cart?.item_subtotal ?? cart?.total ?? 0
  const shippingTotal = cart?.shipping_total ?? 0
  const total = cart?.total ?? subtotal

  return (
    <div>
      <CheckoutProgress
        locale={locale}
        countryCode={countryCode}
        currentStep="delivery"
      />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,340px] gap-8 lg:gap-10">
        <div className="min-w-0">
          <CheckoutAddressForm
            locale={locale}
            countryCode={countryCode}
            nextStepPath={nextStepPath}
          />
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
            <div className="bg-neutral-50 rounded-lg p-5 border border-neutral-200 text-sm text-neutral-500">
              No hay ítems en el carrito. Agregá productos para continuar.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
