import mongoose from "mongoose";

const anestheticsAssessmentSchema = new mongoose.Schema({

    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Patient",
        required: true
    },
    enteredDate: {
        type: Date,
        default: Date.now
    },

    anestheticsAssessmentSheet: { type: String },
    anestheticsAssessmentData: {},
    signatureDocument: {
        type: String
    },

}, { timestamps: true });

const AnestheticsAssessment = mongoose.model("AnestheticsAssessment", anestheticsAssessmentSchema);
export default AnestheticsAssessment;
