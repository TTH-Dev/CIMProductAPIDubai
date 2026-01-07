import mongoose from "mongoose";

const pharmacyVendorSchema = new mongoose.Schema(
  {
    organizationId: {
      type: String,
      required: true,
    },
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
    },
    vendorName: { type: String, required: true },
    GSTNo: { type: String },
    phoneNo: {
      type: String,
    },
    email: {
      type: String,
    },
    bankAccountNumber: { type: String },
    address: { type: String },
    bankIFSCCode: { type: String },
    city: {
      type: String,
    },
    pincode: {
      type: String,
    },
    bankholderName: {
      type: String,
    },
    paymentType: { type: String },

    communicationMode: { type: String },
    purchaseLimit: { type: Number, default: 0 },
    deliveryDay: { type: String },
    daysToDeliver: { type: Number, default: 0 },

    taxType: { type: String },
    bankName: { type: String },
    creditPeriod: { type: Number },
    status: { type: String },
    hospital: { type: String },
    PhpVendorNo: { type: String },
    stockAdjustment: { type: Boolean, default: false },
  },
  { timestamps: true }
);

pharmacyVendorSchema.pre("save", async function (next) {
  if (!this.PhpVendorNo) {
    const lastVendor = await mongoose
      .model("PharmacyVendor")
      .findOne({}, {}, { sort: { createdAt: -1 } });

    let nextId = "PHVEN001";
    if (lastVendor && lastVendor.PhpVendorNo) {
      const lastNumber = parseInt(
        lastVendor.PhpVendorNo.replace("PHVEN", ""),
        10
      );
      nextId = `PHVEN${String(lastNumber + 1).padStart(3, "0")}`;
    }
    this.PhpVendorNo = nextId;
  }
  next();
});

const PharmacyVendor = mongoose.model("PharmacyVendor", pharmacyVendorSchema);

export default PharmacyVendor;
