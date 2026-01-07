import mongoose from "mongoose";

const preAnestheticFitnessSchema = new mongoose.Schema({

    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Patient",
        required: true
    },
    enteredDate: {
        type: Date,
        default: Date.now
    },
    preAnestheticFitnessData: {},

    preAnestheticFitnessSheet: { type: String }

}, { timestamps: true });

const PreAnestheticFitness = mongoose.model("PreAnestheticFitness", preAnestheticFitnessSchema);
export default PreAnestheticFitness;
