import mongoose from "mongoose";

const surgicalSafetyCheckLitsSchema = new mongoose.Schema({

    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Patient",
        required: true
    },
    enteredDate: {
        type: Date,
        default: Date.now
    },

    surgicalSafetyCheckLitsSheet: { type: String },
    surgicalSafetyCheckLitsData: {},
    surgeonSignatureDocument: {
        type: String
    },
    anesthetistsSignatureDocument: {
        type: String
    },
    ursingStaffSignatureDocument: {
        type: String
    },

}, { timestamps: true });

const SurgicalSafetyCheckLits = mongoose.model("SurgicalSafetyCheckLits", surgicalSafetyCheckLitsSchema);
export default SurgicalSafetyCheckLits;
