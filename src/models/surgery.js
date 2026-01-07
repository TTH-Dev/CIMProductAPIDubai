import mongoose from "mongoose";

const surgerySchema = new mongoose.Schema({

    name: {
        type: String
    },
    code: {
        type: String
    },
    type: [{
        iol: String,
        amount: Number
    }],
    patientType: {
        type: String,
        enum: ["general", "corporate", "insurance"]
    }
}, { timestamps: true }
);

const Surgery = mongoose.model("Surgery", surgerySchema);
export default Surgery;