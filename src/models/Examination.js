import mongoose from "mongoose";

const examinationSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Patient",
    required: true,
  },
  heartRate: { type: String },
  rhythm: {
    type: String,
  },
  bp: {
    type: String,
  },
  temp: {
    type: String,
  },
  respRate: {
    type: String,
  },
  spo2: {
    type: String,
  },
  inandout: {
    type: String,
  },
  enteredDate: { type: Date, default: Date.now },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Doctor",
  },
});

const Examination = mongoose.model("Examination", examinationSchema);

export default Examination;
