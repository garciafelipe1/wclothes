/**
 * GET /store/orders?email= — Lista órdenes por email (para ver "mis pedidos" sin login).
 */
import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const email = (req.query?.email as string)?.trim?.()
  if (!email) {
    res.status(400).json({ error: "Falta el parámetro email" })
    return
  }

  try {
    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
    const { data } = await query.graph({
      entity: "order",
      fields: [
        "id",
        "display_id",
        "email",
        "status",
        "payment_status",
        "fulfillment_status",
        "created_at",
        "currency_code",
        "total",
        "subtotal",
        "shipping_total",
        "summary",
        "shipping_address.address_1",
        "shipping_address.postal_code",
        "shipping_address.city",
        "shipping_address.province",
        "shipping_address.phone",
        "items.id",
        "items.title",
        "items.quantity",
        "items.unit_price",
        "items.total",
        "items.thumbnail",
        "items.variant.title",
      ],
      filters: { email },
      pagination: { take: 50, order: { created_at: "DESC" as const } },
    })

    const orders = Array.isArray(data) ? data : []
    res.json({ orders })
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    res.status(500).json({ error: msg })
  }
}
