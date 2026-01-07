import mongoose from "mongoose";


const PastOcularHistorySchema = new mongoose.Schema({
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Patient",
        required: true
    },
    enteredDate: {
        type: Date,
        default: Date.now
    },
    hoTrauma: {
        inputField: {
            type: String
        },
        inputBox: {
            type: Boolean,
            default: false
        }
    },
    hoOcularSx: {
        inputField: {
            type: String
        },
        inputBox: {
            type: Boolean,
            default: false
        }
    },
    pgUse: {
        inputField: {
            type: String
        },
        inputBox: {
            type: Boolean,
            default: false
        }
    }
});

const PastOcularHistory = mongoose.model("PastOcularHistory", PastOcularHistorySchema);
export default PastOcularHistory;