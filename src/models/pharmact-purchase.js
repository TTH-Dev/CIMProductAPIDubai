import mongoose from "mongoose";

const pharmacyPurchaseSchema = new mongoose.Schema(
  {
    products: [
      {
        vendor: {
          type: String,
          required: true,
        },
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
        },
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "PharmacyProduct",
        },
        productName: {
          type: String,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
        rate: {
          type: Number,
          required: true,
        },
        mrp: {
          type: Number,
          required: true,
        },
        taxAmt: {
          type: Number,
          required: true,
        },
      },
    ],
    subTotal: {
      type: Number,
      required: true,
    },
    taxAmt: {
      type: Number,
      required: true,
    },
    total: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["Requested", "Accepted", "Recieved", "Rejected"],
      default: "Requested",
    },
    date: {
      type: Date,
      default: Date.now,
    },
    purchaseNo: {
      type: String,
      unique: true,
    },
    organizationId: {
      type: String,
      required: true,
    },
    branch: {
      type: String,
    },
  },
  { timestamps: true }
);

pharmacyPurchaseSchema.pre("save", async function (next) {
  if (!this.purchaseNo) {
    const lastVendor = await mongoose
      .model("PharmacyPurchase")
      .findOne({}, {}, { sort: { createdAt: -1 } });

    let nextId = "PHPUR001";
    if (lastVendor && lastVendor.purchaseNo) {
      const lastNumber = parseInt(
        lastVendor.purchaseNo.replace("PHPUR", ""),
        10
      );
      nextId = `PHPUR${String(lastNumber + 1).padStart(3, "0")}`;
    }
    this.purchaseNo = nextId;
  }
  next();
});

const PharmacyPurchase = mongoose.model(
  "PharmacyPurchase",
  pharmacyPurchaseSchema
);
export default PharmacyPurchase;
