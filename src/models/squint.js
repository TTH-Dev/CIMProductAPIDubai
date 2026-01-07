import mongoose from "mongoose";


const squintSchmea = new mongoose.Schema({

    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Patient",
        required: true
    },
    patientName: {
        type: String,
    },
    enteredDate: {
        type: Date,
        default: Date.now
    },
    time: {
        type: String
    },
    signatureDocument: {
        type: String
    },
    squintWorkSheet: {
        type: String
    },
    squintData: {}
},
    { timestamps: true });

const Squint = mongoose.model("Squint", squintSchmea);

export default Squint;