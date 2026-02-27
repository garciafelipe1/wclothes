import { redirect } from "next/navigation"

type CartPageProps = {
  params: Promise<{ locale: string; countryCode: string }>
}

/**
 * El carrito se muestra en el slider (ícono en la nav).
 * Redirigimos a home para que el usuario abra el carrito desde el ícono.
 */
export default async function CartPage({ params }: CartPageProps) {
  const { locale, countryCode } = await params
  redirect(`/${locale}/${countryCode}`)
}
