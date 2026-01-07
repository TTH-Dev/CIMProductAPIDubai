import mongoose from "mongoose";

const tpaSchema = new mongoose.Schema({
organizationId:{
      type:String,
      required:true
    },
 
        branch: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Branch",
        },
    insuranceCompanyName: {
        type: String,
        required: true
    },
    insuranceCompanyCoad: {
        type: String,
        required: true
    },
    contactPersonName: {
        type: String
    },
    contactNumber: {
        type: String,
        required: true
    },
    tpaType: {
        type: String,
        enum: ["corporates", "insurance", "general"]
    },
    form: {
        type: String
    }
}, { timestamps: true });

const TPA = mongoose.model("TPA", tpaSchema);
export default TPA;