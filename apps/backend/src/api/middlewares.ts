import { defineMiddlewares } from "@medusajs/framework/http"
import { validateAndTransformQuery } from "@medusajs/framework/http"
import { GetStoreCustomSchema } from "./store/custom/validators"
import { GetStoreProductSchema } from "./store/custom/product/validators"

type SchemaForValidate = Parameters<typeof validateAndTransformQuery>[0]

export default defineMiddlewares({
  routes: [
    {
      matcher: "/store/custom",
      method: "GET",
      middlewares: [validateAndTransformQuery(GetStoreCustomSchema as SchemaForValidate, {})],
    },
    {
      matcher: "/store/custom/product",
      method: "GET",
      middlewares: [validateAndTransformQuery(GetStoreProductSchema as SchemaForValidate, {})],
    },
  ],
})
