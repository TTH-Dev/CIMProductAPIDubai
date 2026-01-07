import mongoose from "mongoose";


const nonContactTonoMetrySchema = new mongoose.Schema({
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Patient",
        required: true
    },
    enteredDate: {
        type: Date,
        default: Date.now
    },
    nonContactTonoMetry: [{
        iop: { type: String },
        od: { type: String },
        os: { type: String },
    }]
});

const colorVisionSchema = new mongoose.Schema({
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Patient",
        required: true
    },
    enteredDate: {
        type: Date,
        default: Date.now
    },
    od: { type: String },
    os: { type: String }
});

const confrontationSchema = new mongoose.Schema({
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Patient",
        required: true
    },
    enteredDate: {
        type: Date,
        default: Date.now

    },
    confrontationImage: {
        type: String
    }
});
const ocularMovementsSchema = new mongoose.Schema({
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Patient",
        required: true
    },
    enteredDate: {
        type: Date,
        default: Date.now

    },
    od: { type: String },
    os: { type: String }
});

const coverTestSchema = new mongoose.Schema({
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Patient",
        required: true
    },
    enteredDate: {
        type: Date,
        default: Date.now

    },
    od: { type: String },
    os: { type: String }
});




const OtherRoutineTestSchema = new mongoose.Schema({
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Patient",
        required: true
    },
    enteredDate: {
        type: Date,
        default: Date.now

    },
    nonContactTonoMetry: [nonContactTonoMetrySchema],
    colorVision: [colorVisionSchema],
    confrontation: [confrontationSchema],
    ocularMovements: [ocularMovementsSchema],
    coverTest: [coverTestSchema],
},
    { timestamps: true });

const OtherRoutineTest = mongoose.model("OtherRoutineTest", OtherRoutineTestSchema);

export default OtherRoutineTest;

