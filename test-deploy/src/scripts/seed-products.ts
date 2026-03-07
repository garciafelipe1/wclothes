import {
  CreateProductWorkflowInputDTO,
  MedusaContainer,
  ProductCategoryDTO,
} from "@medusajs/framework/types";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { ProductStatus } from "@medusajs/framework/utils";
import { createProductsWorkflow } from "@medusajs/medusa/core-flows";
import slugify from "slugify";

import { catalogProducts } from "./seed/products/catalog.seed";
import type { SeedProductItem } from "./seed/products/catalog.seed";

export async function SeedProducts(
  container: MedusaContainer,
  categories: ProductCategoryDTO[],
  shippingProfileId: string,
  defaultSalesChannelId: string
) {
  const query = container.resolve(ContainerRegistrationKeys.QUERY);

  const toHandle = (value: string) =>
    slugify(value, { lower: true, trim: true, strict: true });

  const { data: existingProducts } = await query.graph({
    entity: "product",
    fields: ["handle"],
  });

  const existingHandles = new Set(
    (existingProducts || []).map((p: { handle?: string }) => p.handle).filter(Boolean)
  );

  const { data: existingInventoryItems } = await query.graph({
    entity: "inventory_item",
    fields: ["sku"],
  });

  const existingSkus = new Set(
    (existingInventoryItems || [])
      .map((i: { sku?: string }) => i.sku)
      .filter((sku): sku is string => typeof sku === "string" && sku.length > 0)
  );

  const reservedSkus = new Set<string>(existingSkus);
  const uniqueSku = (preferredSku: string) => {
    if (!reservedSkus.has(preferredSku)) {
      reservedSkus.add(preferredSku);
      return preferredSku;
    }
    let i = 2;
    for (;;) {
      const candidate = `${preferredSku}-${i}`;
      if (!reservedSkus.has(candidate)) {
        reservedSkus.add(candidate);
        return candidate;
      }
      i += 1;
    }
  };

  const buildProduct = (item: SeedProductItem): CreateProductWorkflowInputDTO => {
    const hasCustomOptions = item.productOptions && item.variantOptions && item.productOptions.length > 0 && item.variantOptions.length > 0;
    const options = hasCustomOptions
      ? item.productOptions!
      : [{ title: "Default", values: ["Default"] }];
    const variants = hasCustomOptions
      ? item.variantOptions!.map((opts, i) => ({
          title: Object.values(opts).join(" / "),
          sku: uniqueSku(`${toHandle(item.title)}-${i + 1}`),
          options: opts,
          prices: [
            { amount: item.price.ars, currency_code: "ars" },
            { amount: item.price.usd, currency_code: "usd" },
          ],
        }))
      : [
          {
            title: "Default",
            sku: uniqueSku(`${toHandle(item.title)}-default`),
            options: { Default: "Default" },
            prices: [
              { amount: item.price.ars, currency_code: "ars" },
              { amount: item.price.usd, currency_code: "usd" },
            ],
          },
        ];
    return {
      title: item.title,
      description: item.description,
      category_ids: [
        categories.find((c) => c.name === item.category)?.id,
      ].filter(Boolean) as string[],
      handle: toHandle(item.title),
      status: ProductStatus.PUBLISHED,
      shipping_profile_id: shippingProfileId,
      thumbnail: item.images?.[0] ?? undefined,
      images: item.images.map((url) => ({ url })),
      sales_channels: [{ id: defaultSalesChannelId }],
      metadata: item.metadata ?? {},
      options,
      variants,
    };
  };

  const productsToCreate = catalogProducts
    .filter((i) => !existingHandles.has(toHandle(i.title)))
    .map(buildProduct);

  if (productsToCreate.length === 0) {
    return;
  }

  await createProductsWorkflow(container).run({
    input: { products: productsToCreate },
  });
}
