import mongoose from "mongoose";

const TreatmentSchema = new mongoose.Schema(
  {
    treatmentName: { type: String, required: true },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
    },
    price: {
      type: Number,
      default: 0,
    },
    duration: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const Treatment = mongoose.model("treatment", TreatmentSchema);
export default Treatment;
