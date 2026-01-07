import mongoose from "mongoose";

const ChiefComplaintSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Patient",
    required: true,
  },
  notes: { type: String },
  enteredDate: { type: Date, default: Date.now },
  since: {
    type: Number,
  },
  type: {
    type: String,
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Doctor",
  },
});

const ChiefComplaints = mongoose.model("ChiefComplaints", ChiefComplaintSchema);

export default ChiefComplaints;
