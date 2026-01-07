import mongoose from "mongoose";

const pharmacyProductRequestSchema = new mongoose.Schema(
  {
    organizationId: {
      type: String,
      required: true,
    },
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
    },
    products: [
      {
        vendor: {
          type: String,
        },
        vendorId: {
          type: String,
        },
        productName: {
          type: String,
        },
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "PharmacyProduct",
        },
        unit: {
          type: String,
        },
        quantity: {
          type: Number,
        },
        productType: {
          type: String,
        },
        itemCode: {
          type: String,
        },
        notes:{
          type:String
        },
        requistionStatus:{
          type:String,
        }
      },
    ],
    totalQuantity: {
      type: Number,
    },
    reqID: {
      type: String,
    },
    status: {
      type: String,
      enum: ["Requested", "Approved", "Rejected"],
      default: "Requested",
    },
    category: {
      type: String,
    },
    reqapprovedDate:{
      type:Date
    },
    quoteCreateStatus:{
      type:Boolean
    }
  },
  { timestamps: true }
);

pharmacyProductRequestSchema.pre("save", async function (next) {
  if (!this.reqID) {
    const lastVendor = await mongoose
      .model("pharmacyProductRequest")
      .findOne({}, {}, { sort: { createdAt: -1 } });

    let nextId = "REQ-001";
    if (lastVendor && lastVendor.reqID) {
      const lastNumber = parseInt(lastVendor.reqID.replace("REQ-", ""), 10);
      nextId = `REQ-${String(lastNumber + 1).padStart(3, "0")}`;
    }
    this.reqID = nextId;
  }

  next();
});

const pharmacyProductRequest = mongoose.model(
  "pharmacyProductRequest",
  pharmacyProductRequestSchema
);

export default pharmacyProductRequest;
