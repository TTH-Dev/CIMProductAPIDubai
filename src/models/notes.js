import mongoose from "mongoose";


const notesSchema = new mongoose.Schema({

    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Patient",
        required: true
    },
    notes: {
        type: String,
        required: true
    },
    enteredDate: {
        type: Date,
        default:Date.now
    },

}, { timestamps: true }
);

const Notes = mongoose.model("Notes", notesSchema);

export default Notes;