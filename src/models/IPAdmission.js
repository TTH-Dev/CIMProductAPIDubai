import mongoose from "mongoose";


const IPAdmissionSchema = new mongoose.Schema({
        patientId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Patient",
            required: true
        },
        enteredDate: {
            type: Date,
            default:Date.now
        },
    admissionReason: { type: String },
    tentativeStayInHospital: { type: String },
    notes: { type: String }
});

const IPAdmission = mongoose.model("IPAdmission",IPAdmissionSchema);
export default IPAdmission;