import mongoose from "mongoose";

const preOperativeChecklistSchema = new mongoose.Schema({

    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Patient",
        required: true
    },
    enteredDate: {
        type: Date,
        default: Date.now
    },
    preOperativeChecklistData: {},
    signatureDocument: {
        type: String
    },

}, { timestamps: true });

const PreOperativeChecklist = mongoose.model("PreOperativeChecklist", preOperativeChecklistSchema);
export default PreOperativeChecklist;
