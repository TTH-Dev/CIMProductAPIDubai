import mongoose from "mongoose";

const dentalChartSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },

    row: {
      type: String,
    },
    teethNumber: {
      type: Number,
    },
    teathType: {
      type: String,
    },
    color: {
      type: String,
    },
  },
  { timestamps: true }
);

const DentalChart = mongoose.model("dentalChart", dentalChartSchema);
export default DentalChart;
