import mongoose from "mongoose";

const vendorSchema = new mongoose.Schema(
  {
    organizationId: {
      type: String,
      required: true,
    },
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
    },
    vendorId: { type: String, unique: true },
    vendorName: { type: String, required: true },
    bankAccountNumber: { type: String },
    bankName: { type: String },
    bankIFSCCode: { type: String },
    paymentType: { type: String },
    creditPeriod: { type: Number },
    communicationMode: { type: String },
    daysToDeliver: { type: Number },
    status: { type: String },
    purchaseLimit: { type: Number },
    gstNo: { type: String },
    hospital: {
      type: String,
    },
    deliveryDay: { type: String },
    taxType: { type: String },
    location: { type: String },
  },
  { timestamps: true }
);

vendorSchema.pre("save", async function (next) {
  if (!this.vendorId) {
    const lastVendor = await mongoose
      .model("Vendor")
      .findOne({}, {}, { sort: { createdAt: -1 } });

    let nextId = "VEN001";
    if (lastVendor && lastVendor.vendorId) {
      const lastNumber = parseInt(lastVendor.vendorId.replace("VEN", ""), 10);
      nextId = `VEN${String(lastNumber + 1).padStart(3, "0")}`;
    }
    this.vendorId = nextId;
  }
  next();
});
const Vendor = mongoose.model("Vendor", vendorSchema);

export default Vendor;
