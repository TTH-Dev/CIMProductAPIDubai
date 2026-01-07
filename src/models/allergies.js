import mongoose from "mongoose";

const allergiesSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Patient",
    required: true,
  },
  notes: { type: String },
  enteredDate: { type: Date, default: Date.now },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Doctor",
  },
});

const Allergies = mongoose.model("allergies", allergiesSchema);

export default Allergies;
