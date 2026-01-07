import mongoose from "mongoose";

const pharmacyProductmaster = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    medicineType: {
      type: String,
    },
    unit: {
      type: String,
    },
    hsnCode: {
      type: String,
    },
  },
  { timestamps: true }
);

const pharmacyProductMaster = mongoose.model(
  "pharmacyProductmaster",
  pharmacyProductmaster
);

export default pharmacyProductMaster;
