import mongoose from "mongoose";

const AssociatedComplaintSchema = new mongoose.Schema({
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Patient",
        required: true
    },
    admissionReason: { type: String },
    enteredDate: { type: Date, default: Date.now },
    reactionName: { type: String },
    since: {
        year: { type: String },
        month: { type: String },
        day: { type: String }
    }
});

const AssociatedComplaint = mongoose.model("AssociatedComplaint", AssociatedComplaintSchema);
export default AssociatedComplaint;