import mongoose from "mongoose";

const HistoryOfMajorIllnessSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
  enteredDate: {
    type: Date,
    default: Date.now
  },
  HistoryOfMajorIllnessSchema: [{
    typeName: {
      type: String
    },
    typeValue: {
      type: String
    },
    nil: {
      type: Boolean,
      default: false
    }
  }],
});

const NutritionalAssessmentSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
  enteredDate: {
    type: Date, default: Date.now
  },
  normal: { type: Boolean, default: false },
  diabetic: { type: Boolean, default: false },
  renalFailure: { type: Boolean, default: false },
  cirrhosis: { type: Boolean, default: false },
  hypertensive: { type: Boolean, default: false },
  special: { type: Boolean, default: false },
  jaundice: { type: Boolean, default: false },
  anyOther: { type: Boolean, default: false },
});

const ImmunizationForAdultsSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
  enteredDate: {
    type: Date, default: Date.now
  },
  forAdults: {
    influenza: { type: Boolean, default: false },
    pneumococcal: { type: Boolean, default: false },
    hepatitisA: { type: Boolean, default: false },
    hepatitisB: { type: Boolean, default: false },
    measlesMumps: { type: Boolean, default: false },
    rubella: { type: Boolean, default: false },
    anyOther: { type: Boolean, default: false },
    injectionTetanusToxoid: { type: Boolean, default: false },
  },
  forChildrens: {
    influenza: { type: Boolean, default: false },
    pneumococcal: { type: Boolean, default: false },
    hepatitisA: { type: Boolean, default: false },
    hepatitisB: { type: Boolean, default: false },
    measlesMumps: { type: Boolean, default: false },
    rubella: { type: Boolean, default: false },
    anyOther: { type: Boolean, default: false },
    injectionTetanusToxoid: { type: Boolean, default: false },
    ForPediatricsAsPerVaccinationSchedule: { type: Boolean, default: false },
  }
});

const TypeOfAllergiesSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
  enteredDate: {
    type: Date, default: Date.now
  },
  injections: String,
  tablets: String,
  eyeDrops: String,
  anyOthers: String,
});

const FamilyHistorySchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
  enteredDate: {
    type: Date, default: Date.now
  },
  systemicDisease: String,
  ophthalmicDisease: String,
});

const ScreenUsageSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
  enteredDate: {
    type: Date, default: Date.now
  },
  booleanBox: { type: Boolean, default: false },
  inputBox: { type: String, default: "" },
});

const AnyRegularMedicationSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
  enteredDate: {
    type: Date, default: Date.now
  },
  medication: String,
});

const PreviousSurgeriesSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
  enteredDate: {
    type: Date, default: Date.now
  },
  surgeries: String,
});

const RecentInvestigationSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
  enteredDate: {
    type: Date, default: Date.now
  },
  recentInvestigation: String,
});

const PastHistorySchema = new mongoose.Schema(
  {
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
    enteredDate: {
      type: Date, default: Date.now
    },
    UHIDId: { type: String },
    historyOfMajorIllness: [HistoryOfMajorIllnessSchema],
    typeOfAllergies: [TypeOfAllergiesSchema],
    nutritionalAssessment: [NutritionalAssessmentSchema],
    immunizationForAdults: [ImmunizationForAdultsSchema],
    familyHistory: [FamilyHistorySchema],
    screenUsage: [ScreenUsageSchema],
    anyRegularMedication: [AnyRegularMedicationSchema],
    previousSurgeries: [PreviousSurgeriesSchema],
    recentInvestigation: [RecentInvestigationSchema],
  },
  { timestamps: true }
);

const PastHistory = mongoose.model("PastHistory", PastHistorySchema);

export default PastHistory;
