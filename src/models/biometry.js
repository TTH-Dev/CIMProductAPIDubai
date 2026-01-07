import mongoose from "mongoose";

const biometrySchema = new mongoose.Schema({

    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Patient",
        required: true
    },
       organizationId:{
        type:String,
        required:true
    },
    
        branch: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Branch",
        },
    signatureDocument: {
        type: String
    },
    biometryWorkSheet: {
        type: String
    },
    enteredDate : {
        type : Date,
        default:Date.now
    },
    biometryData:{}

}, { timestamps: true }
);

const Biometry = mongoose.model("Biometry", biometrySchema);

export default Biometry;