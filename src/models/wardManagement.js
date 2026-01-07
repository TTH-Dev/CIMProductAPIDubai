import mongoose from "mongoose";

const wardManagementSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Patient",
    required: true
  },
  wardId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Ward",
    required: true
  },
  roomId: {
    type: mongoose.Schema.Types.ObjectId
  },
  bedIndex: Number,

}, { timestamps: true });

const WardManagement = mongoose.model("WardManagement", wardManagementSchema);
export default WardManagement;
