import mongoose from "mongoose";

const contactLensTestSchema = new mongoose.Schema({
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Patient",
        required: true,
    },

    contactLensTestWorkSheet: {
        type: String
    },
    enteredDate: {
        type: Date,
        default: Date.now
    },
    contactLensData: {},
},
    { timestamps: true });

const ContactLensTest = mongoose.model("ContactLensTest", contactLensTestSchema);

export default ContactLensTest;