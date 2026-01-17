/**
 * Product Migration Script
 * Updates existing products with new field structure and removes deprecated fields
 *
 * Run with: node scripts/update-products.js
 */
import mongoose from "mongoose";
import dotenv from "dotenv";
import { Product } from "../models/model.js";

dotenv.config();

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/b2b_platform";

async function updateProducts() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    // Find all products that need updating
    const products = await Product.find({});
    console.log(`Found ${products.length} products to update`);

    let updatedCount = 0;
    let errorCount = 0;

    for (const product of products) {
      try {
        const updateData = {};

        // Update logistics structure if it has old format
        if (product.logistics) {
          const newLogistics = {
            dispatchTime: {
              parcel: product.logistics.dispatchTime?.parcel || {
                type: product.logistics.dispatchTimeParcel?.mode || "single",
                days: product.logistics.dispatchTimeParcel?.days || 3,
                slabs: product.logistics.dispatchTimeParcel?.slabs || [],
              },
              freight: product.logistics.dispatchTime?.freight || {
                type: product.logistics.dispatchTimeFreight?.mode || "single",
                days: product.logistics.dispatchTimeFreight?.days || 5,
                slabs: product.logistics.dispatchTimeFreight?.slabs || [],
              },
            },
            originCountry: product.logistics.originCountry || "India",
            packagingDetails: product.logistics.packagingDetails || "",
          };
          updateData.logistics = newLogistics;
        } else {
          // Add default logistics if missing
          updateData.logistics = {
            dispatchTime: {
              parcel: { type: "single", days: 3, slabs: [] },
              freight: { type: "single", days: 5, slabs: [] },
            },
            originCountry: "India",
            packagingDetails: "",
          };
        }

        // Update support structure if it has old format or is missing
        if (product.support) {
          const newSupport = {
            freight: product.support.freight || {
              type: "single",
              amount: 0,
              slabs: (product.support.freightSlabs || []).map((s) => ({
                minQty: s.minQty || 1,
                amount: s.amount || 0,
              })),
            },
            paymentFee: product.support.paymentFee || {
              type: "single",
              percent: product.support.paymentFeeCoverLimit || 0,
              slabs: [],
            },
          };
          updateData.support = newSupport;
        } else {
          // Add default support if missing
          updateData.support = {
            freight: { type: "single", amount: 0, slabs: [] },
            paymentFee: { type: "single", percent: 0, slabs: [] },
          };
        }

        // Add default production if missing
        if (!product.production) {
          updateData.production = {
            capacity: "",
          };
        }

        // Add default packaging levels if missing
        if (!product.packagingLevels || product.packagingLevels.length === 0) {
          updateData.packagingLevels = [
            {
              level: 1,
              name: "Unit",
              containsQty: 1,
              weight: 0.5,
              dimensions: { l: 10, w: 10, h: 10 },
              isStackable: true,
              isShippingUnit: true,
            },
          ];
        }

        // Fix price structure - ensure it has all required fields
        if (product.price) {
          updateData.price = {
            type: product.price.type || "single",
            singlePrice: product.price.singlePrice || 0,
            moq: product.price.moq || 1,
            slabs: product.price.slabs || [],
          };
        } else {
          // Add default price if missing
          updateData.price = {
            type: "single",
            singlePrice: 100,
            moq: 1,
            slabs: [],
          };
        }

        // Ensure taxPercent exists (use first definition from model - enum values)
        if (product.taxPercent === undefined || product.taxPercent === null) {
          updateData.taxPercent = 18; // Default GST
        }

        // Perform the update
        await Product.findByIdAndUpdate(product._id, {
          $set: updateData,
          // Remove deprecated fields using $unset
          $unset: {
            "production.certifications": 1,
            "support.freightSlabs": 1,
            "support.paymentFeeCoverLimit": 1,
            "logistics.dispatchTimeParcel": 1,
            "logistics.dispatchTimeFreight": 1,
            certifications: 1,
          },
        });

        updatedCount++;
        console.log(`Updated product ${product._id}: ${product.title}`);
      } catch (err) {
        errorCount++;
        console.error(`Error updating product ${product._id}:`, err.message);
      }
    }

    console.log(`\nMigration complete!`);
    console.log(`Updated: ${updatedCount}`);
    console.log(`Errors: ${errorCount}`);
  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

// Run the migration
updateProducts();
