import mongoose from "mongoose";

const pruchaseSchema = new mongoose.Schema(
  {
    products: [
      {
        vendorId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Vendor",
        },
        productType: {
          type: String,
        },
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
        quantity: {
          type: Number,
        },
      },
    ],
    totalQYT: {
      type: Number,
    },

    status: {
      type: String,
      enum: ["Requested", "Accepted", "Recieved", "Rejected"],
      default: "Requested",
    },
    purChaseReqStatus: {
      type: String,
      enum: ["accept", "change", "cancel"],
    },

    reRequest: {
      type: Boolean,
      default: false,
    },

    purchaseNo: {
      type: String,
      unique: true,
    },
    reqId: {
      type: String,
      unique: true,
    },
    organizationId: {
      type: String,
      required: true,
    },
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
    },

    department: {
      type: String,
    },
    notes: {
      type: String,
    },

  },
  { timestamps: true }
);

pruchaseSchema.pre("save", async function (next) {
  if (!this.purchaseNo) {
    const lastVendor = await mongoose
      .model("Purchase")
      .findOne({}, {}, { sort: { createdAt: -1 } });
    let nextId = "PUR001";
    if (lastVendor && lastVendor.purchaseNo) {
      const lastNumber = parseInt(lastVendor.purchaseNo.replace("PUR", ""), 10);
      nextId = `PUR${String(lastNumber + 1).padStart(3, "0")}`;
    }
    this.purchaseNo = nextId;
  }

  if (!this.reqId) {
    const lastVendor = await mongoose
      .model("Purchase")
      .findOne({}, {}, { sort: { createdAt: -1 } });
    let reqIDS = "IV-0001";
    if (lastVendor && lastVendor.reqId) {
      const lastNumber = parseInt(lastVendor.reqId.replace("IV-", ""), 10);
      reqIDS = `IV-${String(lastNumber + 1).padStart(4, "0")}`;
    }
    this.reqId = reqIDS;
  }

  next();
});

const Purchase = mongoose.model("Purchase", pruchaseSchema);
export default Purchase;
