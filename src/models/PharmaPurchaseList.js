import mongoose from "mongoose";

const pharmacyProductListSchema = new mongoose.Schema(
  {
    organizationId: {
      type: String,
      required: true,
    },

    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
    },
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PharmacyVendor",
      required: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    totalQyt: {
      type: Number,
    },
    totalAmount: {
      type: Number,
    },
    isReturn: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const PharmacyProductList = mongoose.model(
  "PharmacyProductList",
  pharmacyProductListSchema
);

export default PharmacyProductList;
