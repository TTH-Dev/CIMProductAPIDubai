import mongoose from "mongoose";

const tpaDischargeFormSchema = new mongoose.Schema({


    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Patient",
        required: true
    },
    enteredDate: {
        type: Date,
        default: Date.now
    },

    dischargeSummeryData: {},

    doctotSignature: String,

    guardiantSignature: String,

    doctotSignature: String,

    patientSignature: String,

    WitnessSignature: String,

});

const TPADischargeSummery = mongoose.model("TPADischargeSummery", tpaDischargeFormSchema);
export default TPADischargeSummery;