import mongoose from "mongoose";


const PosteriorSegmentSchema = new mongoose.Schema({
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Patient",
        required: true
    },
    enteredDate: {
        type: Date,
        default: Date.now
    },
    posteriorSegmentImage: {
        type: String
    },
    media: { od: { type: String }, os: { type: String } },
    vitreous: { od: { type: String }, os: { type: String } },
    retina: { od: { type: String }, os: { type: String } },
    onh: { od: { type: String }, os: { type: String } },
    macula: { od: { type: String }, os: { type: String } },
    periphery: { od: { type: String }, os: { type: String } },
    od: { type: String },
    os: { type: String }
},
    { timestamps: true });

const PosteriorSegment = mongoose.model("PosteriorSegment", PosteriorSegmentSchema)
export default PosteriorSegment