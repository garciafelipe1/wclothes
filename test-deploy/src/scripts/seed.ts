import {
  CreateInventoryLevelInput,
  ExecArgs,
  ProductCategoryDTO,
} from "@medusajs/framework/types";
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";
import {
  createInventoryLevelsWorkflow,
  createProductCategoriesWorkflow,
  createRegionsWorkflow,
  createSalesChannelsWorkflow,
  createShippingOptionsWorkflow,
  createShippingProfilesWorkflow,
  createStockLocationsWorkflow,
  createTaxRegionsWorkflow,
  linkSalesChannelsToStockLocationWorkflow,
  updateStoresWorkflow,
  updateTaxRegionsWorkflow,
} from "@medusajs/medusa/core-flows";

import slugify from "slugify";

import { CATEGORIES } from "../shared/constants";
import { SeedProducts } from "./seed-products";

function categoryNameToHandle(name: string): string {
  return slugify(name, { lower: true, trim: true, strict: true });
}

export default async function seedDemoData({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const link = container.resolve(ContainerRegistrationKeys.LINK);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const storeModuleService = container.resolve(Modules.STORE);
  const salesChannelModuleService = container.resolve(Modules.SALES_CHANNEL);
  const fulfillmentModuleService = container.resolve(Modules.FULFILLMENT);
  const regionModuleService = container.resolve(Modules.REGION);
  const taxModuleService = container.resolve(Modules.TAX);
  const productModuleService = container.resolve(Modules.PRODUCT);

  const countries = ["ar"];

  logger.info("Seeding store data...");
  const [store] = await storeModuleService.listStores();
  let defaultSalesChannel = await salesChannelModuleService.listSalesChannels({
    name: "Default Sales Channel",
  });

  if (!defaultSalesChannel.length) {
    const { result: salesChannelResult } = await createSalesChannelsWorkflow(
      container
    ).run({
      input: {
        salesChannelsData: [{ name: "Default Sales Channel" }],
      },
    });
    defaultSalesChannel = salesChannelResult;
  }

  logger.info("Seeding region data...");
  const allRegions = await regionModuleService.listRegions();
  // Si ya hay regiones (ej. "ar" ya asignado), reutilizar la primera en lugar de crear
  let region: { id: string };
  if (allRegions.length > 0) {
    region = allRegions[0];
    logger.info("Using existing region: " + region.id);
  } else {
    const { result: regionResult } = await createRegionsWorkflow(container).run({
      input: {
        regions: [
          {
            name: "Argentina",
            currency_code: "ars",
            countries,
            payment_providers: ["pp_system_default"],
          },
        ],
      },
    });
    region = regionResult[0];
  }

  logger.info("Seeding tax regions...");
  const [defaultTaxProvider] = await taxModuleService.listTaxProviders(
    {},
    { take: 1 }
  );
  const defaultTaxProviderId =
    defaultTaxProvider?.id ?? "tp_system";

  const existingTaxRegions = await taxModuleService.listTaxRegions();
  const existingCountryCodes = new Set(
    existingTaxRegions.map((tr: { country_code?: string }) => tr.country_code)
  );
  const countriesToCreate = countries.filter(
    (code) => !existingCountryCodes.has(code)
  );
  if (countriesToCreate.length > 0) {
    await createTaxRegionsWorkflow(container).run({
      input: countriesToCreate.map((country_code) => ({
        country_code,
        provider_id: defaultTaxProviderId,
      })),
    });
  } else {
    logger.info("Tax regions already exist for " + countries.join(", "));
  }

  const regionsWithNullProvider = existingTaxRegions.filter(
    (tr: { provider_id?: string | null }) => tr.provider_id == null
  );
  if (regionsWithNullProvider.length > 0) {
    await updateTaxRegionsWorkflow(container).run({
      input: regionsWithNullProvider.map(
        (tr: { id: string }) => ({
          id: tr.id,
          provider_id: defaultTaxProviderId,
        })
      ),
    });
    logger.info(
      "Updated " + regionsWithNullProvider.length + " tax region(s) with default tax provider."
    );
  }

  logger.info("Seeding stock location...");
  const { result: stockLocationResult } = await createStockLocationsWorkflow(
    container
  ).run({
    input: {
      locations: [
        {
          name: "Principal",
          address: {
            country_code: "ar",
            address_1: "Calle Falsa 123",
            city: "CABA",
            postal_code: "1234",
          },
        },
      ],
    },
  });
  const stockLocation = stockLocationResult[0];

  await updateStoresWorkflow(container).run({
    input: {
      selector: { id: store.id },
      update: {
        supported_currencies: [
          { currency_code: "ars", is_default: true },
          { currency_code: "usd" },
        ],
        default_sales_channel_id: defaultSalesChannel[0].id,
        default_region_id: region.id,
        default_location_id: stockLocation.id,
      },
    },
  });

  await link.create({
    [Modules.STOCK_LOCATION]: { stock_location_id: stockLocation.id },
    [Modules.FULFILLMENT]: { fulfillment_provider_id: "manual_manual" },
  });

  logger.info("Seeding fulfillment...");
  let shippingProfiles = await fulfillmentModuleService.listShippingProfiles({
    type: "default",
  });
  let shippingProfile = shippingProfiles[0] ?? null;

  if (!shippingProfile) {
    const { result: shippingProfileResult } =
      await createShippingProfilesWorkflow(container).run({
        input: {
          data: [
            { name: "Default Shipping Profile", type: "default" },
          ],
        },
      });
    shippingProfile = shippingProfileResult[0];
  }

  const existingFulfillmentSets = await fulfillmentModuleService.listFulfillmentSets(
    { name: "Envío" },
    { relations: ["service_zones"] }
  );
  let fulfillmentSet: { id: string; service_zones?: Array<{ id: string }> };
  if (existingFulfillmentSets.length > 0) {
    fulfillmentSet = existingFulfillmentSets[0];
    logger.info("Using existing fulfillment set: Envío");
  } else {
    fulfillmentSet = await fulfillmentModuleService.createFulfillmentSets({
      name: "Envío",
      type: "shipping",
      service_zones: [
        {
          name: "Argentina",
          geo_zones: [{ type: "country", country_code: "ar" }],
        },
      ],
    });
    // Solo crear el link cuando acabamos de crear el set; si ya existía, el link ya está
    await link.create({
      [Modules.STOCK_LOCATION]: { stock_location_id: stockLocation.id },
      [Modules.FULFILLMENT]: { fulfillment_set_id: fulfillmentSet.id },
    });
  }

  const serviceZoneId = fulfillmentSet.service_zones?.[0]?.id;
  if (serviceZoneId) {
    await createShippingOptionsWorkflow(container).run({
      input: [
        {
          name: "Envío estándar",
          price_type: "flat",
          provider_id: "manual_manual",
          service_zone_id: serviceZoneId,
        shipping_profile_id: shippingProfile.id,
        type: {
          code: "standard",
          label: "Estándar",
          description: "Envío en 3-5 días.",
        },
        prices: [
          { currency_code: "ars", amount: 5000 },
          { currency_code: "usd", amount: 5 },
          { region_id: region.id, amount: 5000 },
        ],
        rules: [
          { attribute: "enabled_in_store", value: "true", operator: "eq" },
          { attribute: "is_return", value: "false", operator: "eq" },
        ],
      },
    ],
  });
  }

  await linkSalesChannelsToStockLocationWorkflow(container).run({
    input: { id: stockLocation.id, add: [defaultSalesChannel[0].id] },
  });

  logger.info("Publishable API key: usando la que tenés en .env (el seed no crea keys nuevas).");

  logger.info("Seeding product categories and products...");
  const categoryNames = Object.values(CATEGORIES);
  const { data: allCategoriesData } = await query.graph({
    entity: "product_category",
    fields: ["id", "name", "handle"],
  });
  const allCategoriesList = Array.isArray(allCategoriesData) ? allCategoriesData : [];
  const existingHandles = new Set(
    allCategoriesList
      .map((c: { handle?: string; name?: string }) =>
        categoryNameToHandle(c.handle || c.name || "")
      )
      .filter((h): h is string => h.length > 0)
  );
  const toCreate = categoryNames.filter(
    (name) => !existingHandles.has(categoryNameToHandle(name))
  );
  if (toCreate.length > 0) {
    await createProductCategoriesWorkflow(container).run({
      input: {
        product_categories: toCreate.map((name) => ({
          name,
          is_active: true,
        })),
      },
    });
  }
  const { data: allCategoriesAfterData } = await query.graph({
    entity: "product_category",
    fields: ["id", "name", "handle"],
  });
  const allCategoriesAfterList = Array.isArray(allCategoriesAfterData) ? allCategoriesAfterData : [];
  const ourHandles = new Set(categoryNames.map(categoryNameToHandle));
  const categoryResult: ProductCategoryDTO[] = allCategoriesAfterList.filter(
    (c: { handle?: string; name?: string }) =>
      ourHandles.has(categoryNameToHandle(c.handle || c.name || ""))
  ) as ProductCategoryDTO[];

  await SeedProducts(
    container,
    categoryResult,
    shippingProfile.id,
    defaultSalesChannel[0].id
  );

  logger.info("Seeding inventory levels...");
  const [storeUpdated] = await storeModuleService.listStores();
  const locationId =
    (storeUpdated as { default_location_id?: string } | undefined)?.default_location_id ?? stockLocation.id;

  const { data: inventoryItems } = await query.graph({
    entity: "inventory_item",
    fields: ["id"],
  });
  const allItemIds = (inventoryItems || []).map((item: { id: string }) => item.id);

  const { data: existingLevels } = await query.graph({
    entity: "inventory_level",
    fields: ["inventory_item_id"],
    filters: { location_id: locationId },
  });
  const itemIdsWithLevel = new Set(
    (existingLevels || []).map((l: { inventory_item_id?: string }) => l.inventory_item_id).filter(Boolean)
  );

  const itemIdsWithoutLevel = allItemIds.filter((id: string) => !itemIdsWithLevel.has(id));
  const inventoryLevels: CreateInventoryLevelInput[] = itemIdsWithoutLevel.map(
    (inventory_item_id: string) => ({
      location_id: locationId,
      stocked_quantity: 100,
      inventory_item_id,
    })
  );

  if (inventoryLevels.length) {
    await createInventoryLevelsWorkflow(container).run({
      input: { inventory_levels: inventoryLevels },
    });
    logger.info("Created " + inventoryLevels.length + " inventory level(s) for location Principal.");
  }

  logger.info("Seed finished.");
}
