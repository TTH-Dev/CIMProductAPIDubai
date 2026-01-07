import mongoose from "mongoose";


const RefractionSheetSchema = new mongoose.Schema({
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Patient",
        required: true
    },
    enteredDate: {
        type: Date,
        default: Date.now
    },
    refractionSheet: {
        type: String
    },
    uva: {
        od: { day: { type: [String] }, night: { type: [String] } },
        os: { day: { type: [String] }, night: { type: [String] } }
    },
    pgp: {
        os: { day: { type: [String] }, night: { type: [String] } },
        od: { day: { type: [String] }, night: { type: [String] } }
    },
    pgv: {
        os: { day: { type: [String] }, night: { type: [String] } },
        od: { day: { type: [String] }, night: { type: [String] } }
    },
    phv: {
        os: { day: { type: [String] }, night: { type: [String] } },
        od: { day: { type: [String] }, night: { type: [String] } }
    },
    pgCondition: { od: { type: String }, os: { type: String } },
    frame: { od: { type: String }, os: { type: String } },
    lens: { od: { type: String }, os: { type: String } },
    arValue: { od: { type: String }, os: { type: String } },
    cycloValue: { od: { type: String }, os: { type: String } },
    acc: { od: { type: String }, os: { type: String } },
    add: { od: { type: String }, os: { type: String } },
    fogging: { done: { type: Boolean, default: false }, notDone: { type: Boolean, default: false } },
    duoChromeBalance: { done: { type: Boolean, default: false }, notDone: { type: Boolean, default: false } },
    ipd: {
        ou: { type: String },
        dilatation: { type: String },
        os: { type: String },
        advice: { type: String }
    }
});

const RefractionSheet = mongoose.model("RefractionSheet", RefractionSheetSchema);
export default RefractionSheet;