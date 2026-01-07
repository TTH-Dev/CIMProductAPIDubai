import mongoose from "mongoose";

const anestheticsNotesSchema = new mongoose.Schema({

    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Patient",
        required: true
    },
    enteredDate: {
        type: Date,
        default: Date.now
    },
    anestheticsNotesData: {},
    anestheticsNotesSheet: { type: String },
    signatureDocument: {
        type: String
    },
}, { timestamps: true });

const AnestheticsNotes = mongoose.model("AnestheticsNotes", anestheticsNotesSchema);
export default AnestheticsNotes;
