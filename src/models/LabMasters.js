import mongoose from "mongoose";

const labMasterSchema = new mongoose.Schema(
  {
    testName: { type: String, required: true },
    sampleType: { type: String },
    values: [
      {
        testVitals: { type: String },
        unit: { type: String },
        more: [
          {
            referenceValues: { type: String },
            gender: {
              type: String,
            },
          },
        ],
      },
    ],
  },
  { timestamps: true }
);

const labMaster = mongoose.model("labMaster", labMasterSchema);

export default labMaster;
