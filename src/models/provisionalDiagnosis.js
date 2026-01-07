import mongoose from "mongoose";

const provisionalDiagnosisSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
    },
    orgnizationId:{
      type:String
    },
   
        branch: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Branch",
        },
    provisionalDiagnosis: [
      {
        name: {
          type: String,
        },
        day: {
          type: Number,
        },
        month: {
          type: Number,
        },
        year: {
          type: Number,
        },
        isPrimaryDiagnosis: {
          type: Boolean,
          default: false,
        },
      },
    ],
    enteredDate: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const ProvisionalDiagnosis = mongoose.model(
  "ProvisionalDiagnosis",
  provisionalDiagnosisSchema
);

export default ProvisionalDiagnosis;
