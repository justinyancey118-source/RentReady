
require("dotenv").config({
  path: require("path").resolve(__dirname, "../../.env"),
});

const mongoose = require("mongoose");
const connectDB = require("../config/db");
const RentalProduct = require("../models/RentalProduct");
const RentalPackage = require("../models/RentalPackage");

// Initial catalog based on the rental prices supplied for RentReady.
// Inventory quantities are placeholders until actual stock is confirmed.
const catalog = [
  {
    name: "15 Yard Dumpster",
    category: "dumpster",
    description: "15-yard dumpster rental with 12 days included in the listed base price.",
    sourceUrl:
      "https://www.azrental.solutions/items/15_yard_dumpster_up_to_12_days/",
    packages: [
      {
        durationType: "day",
        durationValue: 12,
        price: 290,
        includedDays: 12,
        extraDayPrice: 20,
      },
    ],
  },
  {
    name: "20 Yard Dumpster",
    category: "dumpster",
    description: "20-yard dumpster rental with 12 days included in the listed base price.",
    sourceUrl:
      "https://www.azrental.solutions/items/20_yard_dumpster_up_to_12_days/",
    packages: [
      {
        durationType: "day",
        durationValue: 12,
        price: 340,
        includedDays: 12,
        extraDayPrice: 20,
      },
    ],
  },
  {
    name: "27 Ton Hydraulic Wood Splitter",
    category: "equipment",
    description: "Hydraulic wood splitter available in multiple rental durations.",
    sourceUrl:
      "https://www.azrental.solutions/items/27_ton_hydraulic_wood_splitter_1_day/",
    packages: [
      { durationType: "hour", durationValue: 4, price: 59 },
      { durationType: "day", durationValue: 1, price: 89 },
      { durationType: "week", durationValue: 1, price: 386 },
      { durationType: "week", durationValue: 4, price: 1100 },
    ],
  },
  {
    name: "20' Lamar Flatbed Trailer",
    category: "equipment",
    description: "20-foot Lamar flatbed trailer available in multiple rental durations.",
    sourceUrl:
      "https://www.azrental.solutions/items/20_lamar_flatbed_trailer_1_day/",
    packages: [
      { durationType: "day", durationValue: 1, price: 100 },
      { durationType: "week", durationValue: 1, price: 320 },
      { durationType: "week", durationValue: 4, price: 1145 },
    ],
  },
  {
    name: "MuliQuip 3500 Watt Generator",
    category: "equipment",
    description: "3500-watt generator available in multiple rental durations.",
    sourceUrl:
      "https://www.azrental.solutions/items/muliquip_3500_watt_generator_1_day/",
    packages: [
      { durationType: "hour", durationValue: 4, price: 35 },
      { durationType: "day", durationValue: 1, price: 58 },
      { durationType: "week", durationValue: 1, price: 150 },
      { durationType: "month", durationValue: 1, price: 500 },
    ],
  },
  {
    name: "Wen 1250 Watt Generator",
    category: "equipment",
    description: "1250-watt generator available in multiple rental durations.",
    sourceUrl:
      "https://www.azrental.solutions/items/wen_1250_watt_generator_1_day/",
    packages: [
      { durationType: "hour", durationValue: 4, price: 35 },
      { durationType: "day", durationValue: 1, price: 45 },
      { durationType: "week", durationValue: 1, price: 100 },
      { durationType: "month", durationValue: 1, price: 450 },
    ],
  },
  {
    name: 'Stihl 16" Chainsaw',
    category: "equipment",
    description: '16-inch Stihl chainsaw available in multiple rental durations.',
    sourceUrl:
      "https://www.azrental.solutions/items/stihl_16_inch__chainsaw_1_day/",
    packages: [
      { durationType: "hour", durationValue: 4, price: 31 },
      { durationType: "day", durationValue: 1, price: 58 },
      { durationType: "week", durationValue: 1, price: 150 },
      { durationType: "month", durationValue: 1, price: 400 },
    ],
  },
  {
    name: 'Stihl 20" Chainsaw',
    category: "equipment",
    description: '20-inch Stihl chainsaw available in multiple rental durations.',
    sourceUrl:
      "https://www.azrental.solutions/items/stihl_20_inch__chainsaw_1_day/",
    packages: [
      { durationType: "hour", durationValue: 4, price: 40 },
      { durationType: "day", durationValue: 1, price: 58 },
      { durationType: "week", durationValue: 1, price: 200 },
      { durationType: "month", durationValue: 1, price: 450 },
    ],
  },
  {
    name: "6' X 6' Scaffolding",
    category: "equipment",
    description: "6-foot by 6-foot scaffolding available in multiple rental durations.",
    sourceUrl:
      "https://www.azrental.solutions/items/6_x_6_scaffolding_1_day/",
    packages: [
      { durationType: "hour", durationValue: 4, price: 25 },
      { durationType: "day", durationValue: 1, price: 39 },
      { durationType: "week", durationValue: 1, price: 100 },
      { durationType: "month", durationValue: 1, price: 350 },
    ],
  },
  {
    name: "Graco Airless Paint Sprayer 490",
    category: "equipment",
    description: "Graco Airless Paint Sprayer 490 available for daily rental.",
    sourceUrl:
      "https://www.azrental.solutions/items/graco_airless_paint_sprayer_490_1_day/",
    packages: [
      { durationType: "day", durationValue: 1, price: 95 },
    ],
  },
];

async function seedCatalog() {
  try {
    await connectDB();

    let productsCreated = 0;
    let packagesCreated = 0;

    for (const item of catalog) {
      const existingProduct = await RentalProduct.findOne({
        name: item.name,
      });

      const product = await RentalProduct.findOneAndUpdate(
        { name: item.name },
        {
          $set: {
            category: item.category,
            description: item.description,
            sourceUrl: item.sourceUrl,
            isActive: true,
          },
          $setOnInsert: {
            inventoryQuantity: 1,
            imageUrl: "",
          },
        },
        {
          upsert: true,
          returnDocument: "after",
          runValidators: true,
          setDefaultsOnInsert: true,
        }
      );

      if (!existingProduct) {
        productsCreated++;
      }

      for (const rentalPackage of item.packages) {
        const existingPackage = await RentalPackage.findOne({
          productId: product._id,
          durationType: rentalPackage.durationType,
          durationValue: rentalPackage.durationValue,
        });

        await RentalPackage.findOneAndUpdate(
          {
            productId: product._id,
            durationType: rentalPackage.durationType,
            durationValue: rentalPackage.durationValue,
          },
          {
            $set: {
              ...rentalPackage,
              isActive: true,
            },
          },
          {
            upsert: true,
            returnDocument: "after",
            runValidators: true,
            setDefaultsOnInsert: true,
          }
        );

        if (!existingPackage) {
          packagesCreated++;
        }
      }

      console.log(`Processed: ${item.name}`);
    }

    const totalProducts = await RentalProduct.countDocuments({
      name: { $in: catalog.map((item) => item.name) },
    });

    const totalPackages = await RentalPackage.countDocuments({
      productId: {
        $in: await RentalProduct.find({
          name: { $in: catalog.map((item) => item.name) },
        }).distinct("_id"),
      },
      isActive: true,
    });

    console.log("\nCatalog seeding completed.");
    console.log(`Products created during this run: ${productsCreated}`);
    console.log(`Packages created during this run: ${packagesCreated}`);
    console.log(`Catalog products found: ${totalProducts}`);
    console.log(`Active packages for catalog products: ${totalPackages}`);
  } catch (error) {
    console.error("Catalog seeding failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

seedCatalog();
