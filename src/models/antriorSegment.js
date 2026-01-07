import mongoose from "mongoose";

const anteriorSegmentSchema = new mongoose.Schema({
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Patient",
        required: true
    },
    enteredDate: {
        type: Date,
        default:Date.now
    },
    face: { od: { type: String }, os: { type: String } },
    lids: { od: { type: String }, os: { type: String } },
    lacrimalSystem: { od: { type: String }, os: { type: String } },
    conjunctiva: { od: { type: String }, os: { type: String } },
    cornea: { od: { type: String }, os: { type: String } },
    sclera: { od: { type: String }, os: { type: String } },
    anteriorChamber: { od: { type: String }, os: { type: String } },
    iris: { od: { type: String }, os: { type: String } },
    pupil: { od: { type: String }, os: { type: String } },
    lens: { od: { type: String }, os: { type: String } }
},
{timestamps:true}
);

const AnteriorSegment  = mongoose.model("AnteriorSegment", anteriorSegmentSchema);

export default AnteriorSegment;