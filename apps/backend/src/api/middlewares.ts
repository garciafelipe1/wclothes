import { defineMiddlewares } from "@medusajs/framework/http"
import { validateAndTransformQuery } from "@medusajs/framework/http"
import { GetStoreCustomSchema } from "./store/custom/validators"
import { GetStoreProductSchema } from "./store/custom/product/validators"

export default defineMiddlewares({
  routes: [
    {
      matcher: "/store/custom",
      method: "GET",
      middlewares: [validateAndTransformQuery(GetStoreCustomSchema, {})],
    },
    {
      matcher: "/store/custom/product",
      method: "GET",
      middlewares: [validateAndTransformQuery(GetStoreProductSchema, {})],
    },
  ],
})
