import mongoose from "mongoose";

const medicalHistorySchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Patient",
    required: true,
  },
  
  name: { type: String },
  enteredDate: { type: Date, default: Date.now },
  notes: {
    type: String,
  },

  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Doctor",
  },
});

const MedicalHistory = mongoose.model("MedicalHistory", medicalHistorySchema);

export default MedicalHistory;
