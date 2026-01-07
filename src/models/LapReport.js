import mongoose from "mongoose";

const lapReportSchema = new mongoose.Schema({
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Patient",
        required: true
    },
    organizationId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Organization",
        required:true
    },
   
        branch: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Branch",
        },
    testId: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Test",
    }],
    testData: {},

    testStartTime: {
        type: String
    },
    testEndTime: {
        type: String
    },
    enteredDate: {
        type: Date,
        default: Date.now
    },
    lapReportPdf: {
        type: String
    }
},{timestamps:true});

const LapReport = mongoose.model("LapReport", lapReportSchema);

export default LapReport;


