import mongoose from "mongoose";

const dischargeConsentSchema = new mongoose.Schema({

    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Patient",
        required: true
    },
    enteredDate: {
        type: Date,
        default: Date.now
    },

    dischargeConsentSheet: { type: String },
    dischargeConsentData: {},
    surgeonSignature: {
        type: String
    },
        patientSignature: {
        type: String
    },
        representativeSign: {
        type: String
    },
        witnessSignature: {
        type: String
    },
}, { timestamps: true });

const DischargeConsent = mongoose.model("DischargeConsent", dischargeConsentSchema);
export default DischargeConsent;
