"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { updateCartShippingAddressAction } from "@/app/actions/checkout/update-shipping-address"
import { OpenCartLink } from "@/components/cart/OpenCartLink"

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

function FieldWithCheck({
  valid,
  children,
  inputClassName,
}: {
  valid: boolean
  children: React.ReactElement
  inputClassName?: string
}) {
  const child = children as React.ReactElement<{ className?: string }>
  return (
    <div className="relative">
      {valid && (
        <span
          className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center pointer-events-none"
          aria-hidden
        >
          <CheckIcon />
        </span>
      )}
      {React.cloneElement(child, {
        className: [
          child.props.className,
          valid ? "pr-10" : "",
          inputClassName,
        ]
          .filter(Boolean)
          .join(" "),
      })}
    </div>
  )
}

type CheckoutAddressFormProps = {
  locale: string
  countryCode: string
  nextStepPath: string
}

export function CheckoutAddressForm({
  locale,
  countryCode,
  nextStepPath,
}: CheckoutAddressFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [noNumber, setNoNumber] = useState(false)
  const [values, setValues] = useState<Record<string, string>>({
    email: "",
    first_name: "",
    last_name: "",
    phone: "",
    postal_code: "",
    city: "",
    address_1: "",
    street_number: "",
    address_2: "",
    neighborhood: "",
    tax_id: "",
  })

  function update(name: string, value: string) {
    setValues((prev) => ({ ...prev, [name]: value }))
  }

  function valid(name: string): boolean {
    const v = (values[name] ?? "").trim()
    switch (name) {
      case "email":
        return v.length > 0 && EMAIL_REGEX.test(v)
      case "first_name":
      case "last_name":
      case "postal_code":
      case "city":
      case "address_1":
        return v.length > 0
      case "phone":
      case "address_2":
      case "neighborhood":
      case "tax_id":
        return v.length > 0
      case "street_number":
        return !noNumber && v.length > 0
      default:
        return false
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const form = e.currentTarget
    const formData = new FormData(form)

    const street = (formData.get("address_1") as string)?.trim() ?? ""
    const number = noNumber ? "" : ((formData.get("street_number") as string)?.trim() ?? "")
    const address_1 = number ? `${street} ${number}`.trim() : street

    const address_2Parts = [
      (formData.get("address_2") as string)?.trim(),
      (formData.get("neighborhood") as string)?.trim(),
    ].filter(Boolean)
    const address_2 = address_2Parts.length > 0 ? address_2Parts.join(", ") : undefined

    const input = {
      email: (formData.get("email") as string)?.trim() || undefined,
      first_name: (formData.get("first_name") as string) ?? "",
      last_name: (formData.get("last_name") as string) ?? "",
      address_1,
      address_2,
      city: (formData.get("city") as string) ?? "",
      postal_code: (formData.get("postal_code") as string) ?? "",
      country_code: countryCode,
      province: (formData.get("province") as string)?.trim() || undefined,
      phone: (formData.get("phone") as string)?.trim() || undefined,
    }

    setLoading(true)
    try {
      const result = await updateCartShippingAddressAction(input)
      if (result.success) {
        router.push(nextStepPath)
      } else {
        setError(result.error ?? "Error al guardar")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <p className="text-sm text-red-600 bg-red-50 p-3 rounded" role="alert">
          {error}
        </p>
      )}

      {/* Datos de contacto */}
      <section>
        <h2 className="text-xs font-semibold text-neutral-800 uppercase tracking-wider mb-4">
          Datos de contacto
        </h2>
        <div className="space-y-3">
          <div>
            <label htmlFor="email" className="block text-sm text-neutral-700 mb-1">
              E-mail
            </label>
            <FieldWithCheck valid={valid("email")}>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={values.email}
                onChange={(e) => update("email", e.target.value)}
                className="w-full border border-neutral-200 rounded-md px-3 py-2.5 text-neutral-900 bg-white focus:border-neutral-400 focus:outline-none"
              />
            </FieldWithCheck>
          </div>
          <label className="flex items-center gap-2 text-sm text-neutral-600 cursor-pointer">
            <input type="checkbox" name="newsletter" className="rounded border-neutral-300" defaultChecked />
            Quiero recibir ofertas y novedades por e-mail
          </label>
        </div>
      </section>

      {/* Entrega */}
      <section>
        <h2 className="text-xs font-semibold text-neutral-800 uppercase tracking-wider mb-4">
          Entrega
        </h2>
        <div className="rounded-lg border border-neutral-200 bg-neutral-50/80 p-4">
          <label className="flex items-center justify-between gap-4 cursor-pointer">
            <span className="flex items-center gap-3">
              <input type="radio" name="shipping" value="default" defaultChecked className="text-neutral-800" />
              <span className="text-sm text-neutral-800">
                Envío a domicilio — El costo se calcula en el siguiente paso.
              </span>
            </span>
            <span className="text-sm font-medium text-neutral-600 whitespace-nowrap">
              —
            </span>
          </label>
        </div>
        <button type="button" className="mt-3 flex items-center gap-1 text-sm text-neutral-600 hover:underline">
          Más opciones
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="inline">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
      </section>

      {/* Datos del destinatario */}
      <section>
        <h2 className="text-xs font-semibold text-neutral-800 uppercase tracking-wider mb-4">
          Datos del destinatario
        </h2>
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="first_name" className="block text-sm text-neutral-700 mb-1">
                Nombre *
              </label>
              <FieldWithCheck valid={valid("first_name")}>
                <input
                  id="first_name"
                  name="first_name"
                  type="text"
                  required
                  autoComplete="given-name"
                  value={values.first_name}
                  onChange={(e) => update("first_name", e.target.value)}
                  className="w-full border border-neutral-200 rounded-md px-3 py-2.5 text-neutral-900 bg-white focus:border-neutral-400 focus:outline-none"
                />
              </FieldWithCheck>
            </div>
            <div>
              <label htmlFor="last_name" className="block text-sm text-neutral-700 mb-1">
                Apellido *
              </label>
              <FieldWithCheck valid={valid("last_name")}>
                <input
                  id="last_name"
                  name="last_name"
                  type="text"
                  required
                  autoComplete="family-name"
                  value={values.last_name}
                  onChange={(e) => update("last_name", e.target.value)}
                  className="w-full border border-neutral-200 rounded-md px-3 py-2.5 text-neutral-900 bg-white focus:border-neutral-400 focus:outline-none"
                />
              </FieldWithCheck>
            </div>
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm text-neutral-700 mb-1">
              Teléfono
            </label>
            <FieldWithCheck valid={valid("phone")}>
              <input
                id="phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                value={values.phone}
                onChange={(e) => update("phone", e.target.value)}
                className="w-full border border-neutral-200 rounded-md px-3 py-2.5 text-neutral-900 bg-white focus:border-neutral-400 focus:outline-none"
              />
            </FieldWithCheck>
          </div>

          {/* Código postal + Ciudad (estilo referencia: bloque con pin y Cambiar) */}
          <div className="rounded-lg border border-neutral-200 bg-neutral-50/50 p-3 flex flex-wrap items-end gap-3">
            <div className="flex items-center gap-2 flex-1 min-w-[140px]">
              <span className="text-neutral-500 shrink-0" aria-hidden>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </span>
              <div className="flex-1 min-w-0">
                <label htmlFor="postal_code" className="block text-xs text-neutral-500 mb-0.5">Código postal *</label>
                <FieldWithCheck valid={valid("postal_code")} inputClassName="pr-8">
                  <input
                    id="postal_code"
                    name="postal_code"
                    type="text"
                    required
                    autoComplete="postal-code"
                    placeholder="Ej. 8000"
                    value={values.postal_code}
                    onChange={(e) => update("postal_code", e.target.value)}
                    className="w-full border border-neutral-200 rounded px-2.5 py-2 text-sm text-neutral-900 bg-white focus:border-neutral-400 focus:outline-none"
                  />
                </FieldWithCheck>
              </div>
            </div>
            <div className="flex-1 min-w-[140px]">
              <label htmlFor="city" className="block text-xs text-neutral-500 mb-0.5">Ciudad *</label>
              <FieldWithCheck valid={valid("city")} inputClassName="pr-8">
                <input
                  id="city"
                  name="city"
                  type="text"
                  required
                  autoComplete="address-level2"
                  placeholder="Ej. Buenos Aires"
                  value={values.city}
                  onChange={(e) => update("city", e.target.value)}
                  className="w-full border border-neutral-200 rounded px-2.5 py-2 text-sm text-neutral-900 bg-white focus:border-neutral-400 focus:outline-none"
                />
              </FieldWithCheck>
            </div>
            <button type="button" className="text-sm text-neutral-600 hover:underline pb-2 shrink-0">
              Cambiar
            </button>
          </div>
          <div>
            <label htmlFor="address_1" className="block text-sm text-neutral-700 mb-1">
              Calle *
            </label>
            <FieldWithCheck valid={valid("address_1")}>
              <input
                id="address_1"
                name="address_1"
                type="text"
                required
                autoComplete="street-address-line1"
                value={values.address_1}
                onChange={(e) => update("address_1", e.target.value)}
                className="w-full border border-neutral-200 rounded-md px-3 py-2.5 text-neutral-900 bg-white focus:border-neutral-400 focus:outline-none"
              />
            </FieldWithCheck>
          </div>
          <div className="flex gap-3 items-end">
            <div className="w-24">
              <label htmlFor="street_number" className="block text-sm text-neutral-700 mb-1">
                Número
              </label>
              <FieldWithCheck valid={valid("street_number")}>
                <input
                  id="street_number"
                  name="street_number"
                  type="text"
                  disabled={noNumber}
                  autoComplete="off"
                  value={values.street_number}
                  onChange={(e) => update("street_number", e.target.value)}
                  className="w-full border border-neutral-200 rounded-md px-3 py-2.5 text-neutral-900 bg-white disabled:bg-neutral-100 focus:border-neutral-400 focus:outline-none"
                />
              </FieldWithCheck>
            </div>
            <label className="flex items-center gap-2 text-sm text-neutral-600 pb-2">
              <input
                type="checkbox"
                checked={noNumber}
                onChange={(e) => setNoNumber(e.target.checked)}
                className="rounded"
              />
              Sin número
            </label>
          </div>
          <div>
            <label htmlFor="address_2" className="block text-sm text-neutral-700 mb-1">
              Departamento (opcional)
            </label>
            <FieldWithCheck valid={valid("address_2")}>
              <input
                id="address_2"
                name="address_2"
                type="text"
                autoComplete="off"
                value={values.address_2}
                onChange={(e) => update("address_2", e.target.value)}
                className="w-full border border-neutral-200 rounded-md px-3 py-2.5 text-neutral-900 bg-white focus:border-neutral-400 focus:outline-none"
              />
            </FieldWithCheck>
          </div>
          <div>
            <label htmlFor="neighborhood" className="block text-sm text-neutral-700 mb-1">
              Barrio (opcional)
            </label>
            <FieldWithCheck valid={valid("neighborhood")}>
              <input
                id="neighborhood"
                name="neighborhood"
                type="text"
                autoComplete="off"
                value={values.neighborhood}
                onChange={(e) => update("neighborhood", e.target.value)}
                className="w-full border border-neutral-200 rounded-md px-3 py-2.5 text-neutral-900 bg-white focus:border-neutral-400 focus:outline-none"
              />
            </FieldWithCheck>
          </div>
        </div>
      </section>

      {/* Datos de facturación */}
      <section>
        <h2 className="text-xs font-semibold text-neutral-800 uppercase tracking-wider mb-4">
          Datos de facturación
        </h2>
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm text-neutral-700">
            <input type="checkbox" name="invoice_a" className="rounded" />
            Necesito factura A
          </label>
          <div>
            <label htmlFor="tax_id" className="block text-sm text-neutral-700 mb-1">
              DNI o CUIT
            </label>
            <FieldWithCheck valid={valid("tax_id")}>
              <input
                id="tax_id"
                name="tax_id"
                type="text"
                placeholder="Opcional"
                value={values.tax_id}
                onChange={(e) => update("tax_id", e.target.value)}
                className="w-full border border-neutral-200 rounded-md px-3 py-2.5 text-neutral-900 bg-white focus:border-neutral-400 focus:outline-none"
              />
            </FieldWithCheck>
          </div>
          <label className="flex items-center gap-2 text-sm text-neutral-600">
            <input type="checkbox" name="same_billing" className="rounded" defaultChecked />
            Mis datos de facturación y entrega son los mismos
          </label>
        </div>
      </section>

      <div className="flex flex-wrap gap-3 pt-2">
        <OpenCartLink className="text-sm underline text-neutral-600">
          Volver al carrito
        </OpenCartLink>
      </div>

      <div className="pt-8">
        <button
          type="submit"
          disabled={loading}
          className="w-full sm:w-auto min-w-[260px] px-8 py-3.5 bg-[#4a3728] text-white font-medium rounded-md hover:bg-[#3d2e21] disabled:opacity-50 text-center transition-colors"
        >
          {loading ? "Guardando..." : "Continuar para el pago"}
        </button>
      </div>
    </form>
  )
}
