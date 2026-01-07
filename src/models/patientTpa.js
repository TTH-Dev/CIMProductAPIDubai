import mongoose from "mongoose";

const patinetTpaSchema = new mongoose.Schema({

    surgeryDetailsId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "SurgeryDetails"
    },
    subTotal : {
        type : Number,
    },
    amountPaid : {
        type : Number
    },
    insuranceAmount : {
        type : Number
    },
    pendingAmount : {
        type : Number
    },
},{timestamps:true});

const PatientTpa =  mongoose.model("PatientTpa", patinetTpaSchema);
export default PatientTpa;
