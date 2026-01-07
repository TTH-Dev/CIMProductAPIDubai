import mongoose from "mongoose";

const surgeryNotesSchema = new mongoose.Schema({

    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Patient",
        required: true
    },
    enteredDate: {
        type: Date,
        default: Date.now
    },
    valueType :{
        type : String
    },
    surgeryNotesSheet: { type: String },
    surgeryNotesData: {},
    signatureDocument: {
        type: String
    },

}, { timestamps: true });

const SurgeryNotes = mongoose.model("SurgeryNotes", surgeryNotesSchema);
export default SurgeryNotes;
