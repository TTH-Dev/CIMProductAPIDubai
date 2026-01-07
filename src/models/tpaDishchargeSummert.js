import mongoose from "mongoose";
import PatientTpa from "./patientTpa";


const TpaDischargeSummery = new mongoose.Schema({

    PatientId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Patient"
    },

    dischargeSummeryData : {},

    doctorSignature : {
        type : String,
    },
    patientSignature : {
        type : String,
    },
    guardianSignature : {
        type : String,
    },
    witnessSignature : {
        type : String,
    }
},{timestamps:true});