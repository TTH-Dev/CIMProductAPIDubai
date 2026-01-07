import mongoose from "mongoose";

const MedicineSchema = new mongoose.Schema({
  medicineType: { type: String },
  medicineName: { type: String },
  medicineId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "PharmacyProduct",
  },
  Timing: {
    type: [String],
    enum: ["M", "A", "E", "N"],
  },
  quantity: { type: Number },
  quantityType: { type: String },
  tabletTiming: {
    type: [String],
    enum: ["Before Food", "After Food", "With food","None"],
  },
  duration: { type: String },
});

const FollowUpCheckupSchema = new mongoose.Schema({
  FollowUpPeriod: { type: String },
  chooseDate: { type: String },
  testPrescriptionForFollowUp: { type: String },
});

const nurseStationSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Patient",
    required: true,
  },
  organizationId: {
    type: String,
    required: true,
  },

  branch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Branch",
  },
  nurseName: {
    type: String,
  },
  opNo: {
    type: String,
  },
  enteredDate: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ["Waiting", "Completed"],
    default: "Waiting",
  },
  prescriptionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Prescription",
    required: true,
  },
  medicine: [MedicineSchema],
  description: { type: String },
  admitNow: { type: Boolean, default: false },
  followUpCheckup: FollowUpCheckupSchema,
});

const NurseStation = mongoose.model("NurseStation", nurseStationSchema);
export default NurseStation;
