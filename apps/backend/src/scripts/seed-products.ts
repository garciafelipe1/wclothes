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
    (existingProducts || []).map((p: { handle?: string }) => p.handle)
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

  const shouldCreate = (title: string) => !existingHandles.has(toHandle(title));

  const buildProduct = (item: SeedProductItem): CreateProductWorkflowInputDTO => ({
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
    options: [{ title: "Default", values: ["Default"] }],
    variants: [
      {
        title: "Default",
        sku: uniqueSku(`${toHandle(item.title)}-default`),
        options: { Default: "Default" },
        prices: [
          { amount: item.price.ars, currency_code: "ars" },
          { amount: item.price.usd, currency_code: "usd" },
        ],
      },
    ],
  });

  const productsToCreate = catalogProducts
    .filter((i) => shouldCreate(i.title))
    .map(buildProduct);

  if (productsToCreate.length === 0) {
    return;
  }

  await createProductsWorkflow(container).run({
    input: { products: productsToCreate },
  });
}
