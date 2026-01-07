import mongoose from "mongoose";

const admissionFormSchema = new mongoose.Schema({

    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Patient",
        required: true
    },
    enteredDate: {
        type: Date,
        default: Date.now
    },
    admissionFormData: {},

    admissionFormSheet : {
        type : String
    }


}, { timestamps: true });

const AdmissionForm = mongoose.model("AdmissionForm", admissionFormSchema);
export default AdmissionForm;
