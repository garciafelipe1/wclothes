import { getLocalizedPath } from "@/i18n/routing"
import { getCheckoutData } from "@/lib/data/checkout"
import { CheckoutProgress } from "../_components/CheckoutProgress"
import { CheckoutOrderSummary } from "../_components/CheckoutOrderSummary"
import { CheckoutAddressForm } from "./_components/CheckoutAddressForm"

type AddressPageProps = {
  params: Promise<{ locale: string; countryCode: string }>
}

export default async function AddressPage({ params }: AddressPageProps) {
  const { locale, countryCode } = await params
  const nextStepPath = getLocalizedPath(locale, countryCode, "/checkout/shipping")
  const { items, hasItems, currencyCode, subtotal, shippingTotal, total } = await getCheckoutData()

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
