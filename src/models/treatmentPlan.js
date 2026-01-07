import mongoose from "mongoose";

const treatmentPlanSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },

    rowType: {
      type: String,
    },
    teathNumber: {
      type: Number,
    },
    treatmentPosition: {
      type: [String],
    },
    status: {
      type: String,
      default: "pending",
      enum: ["pending", "inprogress", "completed"],
    },
    diagnosis: {
      type: String,
    },
    treatment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "treatment",
    },
    treatmentDate: {
      type: Date,
    },
    treatmentTime: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const TreatmentPlan = mongoose.model("treatmentPlan", treatmentPlanSchema);

export default TreatmentPlan;
