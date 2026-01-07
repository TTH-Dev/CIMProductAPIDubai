import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {
    englishName: {
      type: String,
      required: true,
    },
    arabicName: {
      type: String,
      required: true,
    },

    cardType: {
      type: String,
      required: true,
    },

    phoneNo: {
      type: String,
      required: true,
    },
    emailId: {
      type: String,
      required: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    patientFileNo: {
      type: String,
    },
    dob: {
      type: Date,
      required: true,
    },
    idCard: {
      type: String,
    },
    fileStatus: {
      type: String,
    },
    gender: {
      type: String,
      required: true,
    },
    marritalStatus: {
      type: String,
      required: true,
    },
    visitType: {
      type: String,
      required: true,
    },
    job: {
      type: String,
    },
    nationality: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    area: {
      type: String,
    },
    recognizer: {
      type: String,
      required: true,
    },
    reasonOfVisit: {
      type: String,
    },
    document: {
      type: String,
    },
    isInsurance: {
      type: Boolean,
    },
    opId: {
      type: String,
    },
    organizationId: { type: String, required: true },

    tokenNo: {
      type: Number,
      required: true,
    },

    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
    },

    billStatus: {
      type: String,
      enum: ["Generated", "Paid", "Not-Generated"],
      default: "Not-Generated",
    },

    queueStatus: {
      type: String,
      default: "waiting",
    },
    discount: {
      type: Number,
      default: 0,
    },

    nurseEMR: {
      type: String,
      default: "pending",
    },
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
    },

    insuranceType: {
      type: String,
    },
    insuranceCode: {
      type: String,
    },
    insuranceName: {
      type: String,
    },
    contractingCode: {
      type: String,
    },
    policyNo: {
      type: String,
    },

    insuranceClass: {
      type: String,
    },
    endDate: {
      type: Date,
    },
    insuranceCard: {
      type: String,
    },
    patientDeduct: {
      type: Number,
    },
    deductPerVisit: {
      type: Number,
    },
    approvalLimit: {
      type: Number,
    },
    visitDate: {
      type: Date,
      required: true,
    },
    visitTime: {
      type: String,
      required: true,
    },
    isReschedue:{
      type:Boolean,
      default:false
    },
    isCancelled:{
         type:Boolean,
      default:false
    },
    cancelReason:{
      type:String
    }
  },

  { timestamps: true }
);

const Appointment = mongoose.model("Appointment", appointmentSchema);

export default Appointment;
