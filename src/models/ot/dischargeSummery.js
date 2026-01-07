import mongoose from "mongoose";

const dischargeSummerySchema = new mongoose.Schema({

    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Patient",
        required: true
    },
    enteredDate: {
        type: Date,
        default: Date.now
    },

    dischargeSummerySheet: { type: String },
    dischargeSummeryData: {},
    DoctorSignature: {
        type: String
    },
    PatientSignature: {
        type: String
    },
    GuardianSignature: {
        type: String
    },
    WitnessSignature: {
        type: String
    },


}, { timestamps: true });

const DischargeSummery = mongoose.model("DischargeSummery", dischargeSummerySchema);
export default DischargeSummery;
