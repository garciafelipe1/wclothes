import { defineMiddlewares } from "@medusajs/framework/http"
import { GetStoreCustomSchema } from "./store/custom/validators"
import { validateAndTransformQuery } from "@medusajs/framework/http"

export default defineMiddlewares({
  routes: [
    {
      matcher: "/store/custom",
      method: "GET",
      middlewares: [validateAndTransformQuery(GetStoreCustomSchema, {})],
    },
  ],
})
