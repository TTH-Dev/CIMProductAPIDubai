import mongoose from "mongoose";

const MedicineSchema = new mongoose.Schema({
  medicineType: { type: String },
  medicineName: { type: String },
  medicineId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "PharmacyProduct",
    required: true,
  },
  Timing: {
    type: [String],
    enum: ["M", "A", "E", "N"],
  },
  quantity: { type: Number },
  quantityType: { type: String },
  tabletTiming: {
    type: [String],
    enum: ["Before Food", "After Food", "With food", "None"],
  },
  duration: { type: String },
});

const FollowUpCheckupSchema = new mongoose.Schema({
  FollowUpPeriod: { type: String },
  chooseDate: { type: String },
  testPrescriptionForFollowUp: { type: String },
});

const PrescriptionSchema = new mongoose.Schema({
  organizationId: {
    type: String,
  },

  branch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Branch",
  },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Patient",
    required: true,
  },
  enteredDate: {
    type: Date,
    default: Date.now,
  },
  prescriptionFor: {
    type: String,
    enum: ["ip", "op", "ap"],
    default: ["op"],
  },
  nurseStationData: [{}],
  medicine: [MedicineSchema],
  description: { type: String },
  admitNow: { type: Boolean, default: false },
  followUpCheckup: FollowUpCheckupSchema,
});

const Prescription = mongoose.model("Prescription", PrescriptionSchema);
export default Prescription;
