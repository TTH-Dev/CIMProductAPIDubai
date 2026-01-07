import mongoose from "mongoose";

const demoSchema = new mongoose.Schema(
  {
    organizatioName: {
      type: String,
      required: true,
    },
    contactPerson: {
      type: String,
      required: true,
    },
    organizatioType: {
      type: String,
      required: true,
    },

    lookingFor: {
      type: String,
    },
    contactPersonPhNo: {
      type: String,
      required: true,
    },
    contactPersonEmail: {
      type: String,
      required: true, 
    },
    status: {
      type: String,
      default: "pending",
      enum: ["pending", "fixed", "completed", "rejected", "approved"],
    },
  },
  { timestamps: true }
);

const Demo = mongoose.model("Demo", demoSchema);

export default Demo;
