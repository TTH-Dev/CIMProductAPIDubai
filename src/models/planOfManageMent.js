import mongoose from "mongoose";


const pomSchema = new mongoose.Schema({

    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Patient",
        required: true
    },
    investigation: {
        type: String,
    },
    medicalSheet: {
        type: String,
    },
    glassPrescription: {
        type: String,
    },
    procedure: {
        type: String,
    },
    enteredDate: {
        type: Date,
        default:Date.now
    },

}, { timestamps: true }
);

const Pom = mongoose.model("Pom", pomSchema);

export default Pom;