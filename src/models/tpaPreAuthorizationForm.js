import mongoose from "mongoose";


const tpaPreAuthorizationFormSchema = new mongoose.Schema({

    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Patient",
        required: true,
    },

    enteredDate: {
        type: Date,
        default: Date.now
    },

    tpaPreAuthorizationFormData: {}

},{ timestamps:true});


const TPAPreAuthorizationForm = mongoose.model("TPAPreAuthorizationForm", tpaPreAuthorizationFormSchema);
export default TPAPreAuthorizationForm;