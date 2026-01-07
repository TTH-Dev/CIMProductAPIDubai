import mongoose from "mongoose";

const pharmacyProductSchema = new mongoose.Schema(
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
    name: { type: String, required: true },
    hsnCode: { type: String },
    unit: {
      type: String,
    },
    salesTax1: { type: Number, default: 0 },
    salesTax2: { type: Number, default: 0 },
    purchaseTax1: { type: Number, default: 0 },
    purchaseTax2: { type: Number, default: 0 },
    MRP: { type: Number },
    MRP2: { type: Number },
    cost: { type: Number },
    medicineType: { type: String },
    quantity: {
      type: Number,
    },
    quantityUnit: {
      type: String,
    },
itemCode:{
  type:String
},
    multiData:[{
      batchNo:{
        type:Number
      },
      expDate:{
        type:Date
      },
      stock:{
        type:Number
      },
      minimumStock:{
        type:Number
      }
    }]
  },
  { timestamps: true }
);




pharmacyProductSchema.pre("save", async function (next) {
  if (!this.itemCode) {
    const lastVendor = await mongoose
      .model("PharmacyProduct")
      .findOne({}, {}, { sort: { createdAt: -1 } });

    let nextId = "ITC0001";
    if (lastVendor && lastVendor.itemCode) {
      const lastNumber = parseInt(lastVendor.itemCode.replace("ITC", ""), 10);
      nextId = `ITC${String(lastNumber + 1).padStart(3, "0")}`;
    }
    this.itemCode = nextId;
  }

  next();
});


const PharmacyProduct = mongoose.model(
  "PharmacyProduct",
  pharmacyProductSchema
);

export default PharmacyProduct;
