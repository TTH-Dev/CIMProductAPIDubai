import mongoose from "mongoose";

const DoctorIndentSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      default: "send",
    },
    doctorId:{
          type: mongoose.Schema.Types.ObjectId,
          ref: "Doctor",
          require: true,
    },
    products: [
      {
        vendorId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Vendor",
          require: true,
        },
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
        quantity: {
          type: Number,
        },
        unit: {
          type: String,
        },
      },
    ],
    totalQTY: {
      type: Number,
    },
    totalProducts: {
      type: Number,
    },

    date: {
      type: Date,
      default: Date.now,
    },
    purchaseNo: {
      type: String,
      unique: true,
    },
  },
  { timestamps: true }
);

DoctorIndentSchema.pre("save", async function (next) {
  if (!this.purchaseNo) {
    const lastVendor = await mongoose
      .model("doctorIndents")
      .findOne({}, {}, { sort: { createdAt: -1 } });
    let nextId = "PUR001";
    if (lastVendor && lastVendor.purchaseNo) {
      const lastNumber = parseInt(lastVendor.purchaseNo.replace("PUR", ""), 10);
      nextId = `PUR${String(lastNumber + 1).padStart(3, "0")}`;
    }
    this.purchaseNo = nextId;
  }
  next();
});

const DoctorIndents = mongoose.model("doctorIndents", DoctorIndentSchema);
export default DoctorIndents;
