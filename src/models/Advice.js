import mongoose from "mongoose";

const dentalAdviceSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },
    notes: {
      type: String,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
    },
  },
  { timestamps: true }
);

const DentalAdvice = mongoose.model("dentalAdvice", dentalAdviceSchema);

export default DentalAdvice;
