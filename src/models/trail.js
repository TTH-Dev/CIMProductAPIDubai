import mongoose from "mongoose";

const trailFormSchema = new mongoose.Schema(
  {
    organizationName: {
      type: String,
      required: true,
    },
    organizationType: {
      type: String,
    },
    type: {
      type: String,
    },
    contactNo: {
      type: String,
    },
    address: {
      type: String,
    },
    country: {
      type: String,
      required: true,
    },
    choosePlan: {
      type: String,
    },
    contactPerson: {
      type: String,
      required: true,
    },
    contactPersonPhNo: {
      type: String,
      required: true,
    },
    contactPersonEmail: {
      type: String,
      required: true,
    },
    approveStatus:{
      type:String,
      default:"pending"
    }
  },
  { timestamps: true }
);

const TrailFormSchema = mongoose.model("TrailFormSchema", trailFormSchema);
export default TrailFormSchema;
