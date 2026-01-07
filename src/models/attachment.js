import mongoose from "mongoose";

const attachmentSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Patient",
    required: true,
  },
  attachments: {type:String},
  notes:{
    type:String
  },
  enteredDate: { type: Date, default: Date.now },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Doctor",
  },
});

const Attachments = mongoose.model("attachments", attachmentSchema);

export default Attachments;
