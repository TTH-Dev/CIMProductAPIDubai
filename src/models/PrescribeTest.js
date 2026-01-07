import mongoose from "mongoose";

const PrescribeTestSchema = new mongoose.Schema({
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
    enteredDate: {
        type: Date
    },
    suggestBy : {
        type : String,
        enum : ["doctor","counsellor"]
    },
    testId: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Test",
        required: true
    }],
    status : {
        type : String,
        enum : ["Pending","Completed"],
        default: "Pending"
    },
    billStatus : {
        type : String,
        enum : ["Paid","Unpaid"],
        default: "Unpaid"
    },
    lapReportId : {
        type: mongoose.Schema.Types.ObjectId,
        ref: "LapReport",
    }
});

const PrescribeTest = mongoose.model("PrescribeTest", PrescribeTestSchema);
export default PrescribeTest;