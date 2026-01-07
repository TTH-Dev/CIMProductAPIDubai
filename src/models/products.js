import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    organizationId: {
      type: String,
      required: true,
    },

    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
    },
    productName: {
      type: String,
    },
    productId: {
      type: String,
    },
    productRate: {
      type: String,
    },
    purchaseTax1: {
      type: Number,
    },
    purchaseTax2: {
      type: Number,
    },
    purchaseTax3: {
      type: Number,
    },
    purchaseTax4: {
      type: Number,
    },
    purchaseAccount: {
      type: String,
    },
    itemCode: {
      type: String,
    },
    mrp: {
      type: Number,
    },
    orderQuantity: {
      type: Number,
    },
    productQuantity: {
      type: Number,
    },
    manufacturerName: {
      type: String,
    },
    note: {
      type: String,
    },
    hsnCode: {
      type: String,
    },
    units: {
      type: String,
    },
    productType: {
      type: String,
    },
    minimumTax: {
      type: String,
    },
    collectionCategory: {
      type: String,
    },
    status: {
      type: String,
    },
    purchaseReturnAccount: {
      type: String,
    },
    slotStatus: {
      type: Boolean,
    },
    lastpurchaseDate: {
      type: Date,
    },
    multiData: [
      {
        batchNo: {
          type: String,
        },
        expDate: {
          type: Date,
        },
        stock: {
          type: Number,
        },
      },
    ],
  },
  { timestamps: true }
);

productSchema.pre("save", async function (next) {
  if (!this.productId) {
    const lastProduct = await mongoose
      .model("Product")
      .findOne({}, {}, { sort: { createdAt: -1 } });

    let nextId = "PRO001";
    if (lastProduct && lastProduct.productId) {
      const lastNumber = parseInt(lastProduct.productId.replace("PRO", ""), 10);
      nextId = `PRO${String(lastNumber + 1).padStart(3, "0")}`;
    }
    this.productId = nextId;
  }
  next();
});

const Product = mongoose.model("Product", productSchema);

export default Product;
