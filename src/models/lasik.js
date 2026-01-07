import mongoose from "mongoose";

const lasikSchema = new mongoose.Schema({

    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Patient",
        required: true
    },
    fullName: {
        type: String,
        required: false
    },
    opNo: {
        type: String,
        required: false
    },
    ageAndSex: {
        type: String
    },
    time: {
        type: String
    },
    signatureDocument: {
        type: String
    },
    lasikWorkSheet: {
        type: String
    },
    enteredDate : {
        type : Date,
        default:Date.now
    },
    lasikData:{

    }

}, { timestamps: true }
);

const Lasik = mongoose.model("Lasik", lasikSchema);

export default Lasik;