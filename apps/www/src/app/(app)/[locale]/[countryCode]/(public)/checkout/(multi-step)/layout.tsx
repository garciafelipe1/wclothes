export default function CheckoutMultiStepLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="checkout-light-theme min-h-screen bg-white text-neutral-900">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 lg:py-12">
        {children}
      </div>
    </div>
  )
}
