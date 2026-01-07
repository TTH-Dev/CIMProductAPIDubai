import mongoose from "mongoose";

const glaucomaSchema = new mongoose.Schema({

    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Patient",
        required: true,
    },
    opNo: {
        type: String
    },
    date: {
        type: Date
    },
    time: {
        type: String
    },
    signatureDocument: {
        type: String
    },
    glaucomaWorkSheet: {
        type: String
    },
    enteredDate : {
        type : Date,
        default:Date.now
    },
    glaucomaData : {}
},
    { timestamps: true });

const Glaucoma = mongoose.model("Glaucoma", glaucomaSchema);

export default Glaucoma;