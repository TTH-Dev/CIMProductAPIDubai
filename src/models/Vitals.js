import mongoose from "mongoose";

const VitalsSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Patient",
    required: true,
  },
  height: { type: String },
  weight: {
    type: String,
  },
  bmi: {
    type: String,
  },
  waistCircumference: {
    type: String,
  },
  BPSystolic: {
    type: String,
  },
  BPDiastolic: {
    type: String,
  },
  pluse: {
    type: String,
  },
  hc: {
    type: String,
  },
  temperature: {
    type: String,
  },

  enteredDate: { type: Date, default: Date.now },

  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Doctor",
  },
});

const Vitals = mongoose.model("Vitals", VitalsSchema);

export default Vitals;
