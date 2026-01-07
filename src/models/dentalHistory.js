import mongoose from "mongoose";

const DentalHistorySchema = new mongoose.Schema({
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Patient",
        required: true
    },
    history: { type: String },
    enteredDate: { type: Date, default: Date.now },
    since:{
        type:Number
    },
    sinceType:{
        type:String
    }
});

const DentalHistory = mongoose.model("DentalHistory", DentalHistorySchema);
export default DentalHistory;