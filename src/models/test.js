import mongoose from "mongoose";

const testSchema = new mongoose.Schema(
  {
    organizationId: {
      type: String,
      required: true,
    },

    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
    },
    testName: { type: String, required: true },
    sampleType: { type: String },
    price: { type: Number, required: true },
    productName: { type: String },
    quantityUsage: { type: Number, default: 0 },
    countType: { type: String },
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

const Test = mongoose.model("Test", testSchema);

export default Test;
