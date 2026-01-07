import mongoose from "mongoose";


const otRequiredProductsSchema = new mongoose.Schema({

  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product"
  },
  currentStock: {
    type: Number
  },
  minimumStock: {
    type: Number
  },
  usedStock: {
    type: Number
  },
  batchNo: {
    type: String
  },
  unit:{
    type:String
  },
  productName: {
    type: String
  },
}, { timestamps: true });

export const OtRequired = mongoose.model("OtRequired", otRequiredProductsSchema);

const otRequiredLensSchema = new mongoose.Schema({
  brand: {
    type: String
  },
  model: {
    type: String
  },
  power: {
    type: String
  },
  actualStock: {
    type: Number
  },
}, { timestamps: true });

export const OtLens = mongoose.model("OtLens", otRequiredLensSchema);

const otRequestSchema = new mongoose.Schema({
  products: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      productName: String,
      currentStock: Number,
      requiredStock: Number,
      requestingStock: Number,
    }
  ],
  totalProducts: Number,
  totalQuantity: Number,
  requestDate: {
    type: Date,
    default: Date.now,
  },
  receivedDate: {
    type: Date,
  },
  status: {
    type: String,
    enum: ["pending", "approved", "updated"],
    default: "pending",
  }
}, { timestamps: true });

export const OtRequest = mongoose.model("OtRequest", otRequestSchema);

