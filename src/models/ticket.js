import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema(
  {
    empName: { type: String, required: true },
    empID: {
      type: String,
      required: true,
    },
    issueHead: {
      type: String,
      required: true,
    },
    priority: {
      type: String,
      required: true,
    },
    issueinDetail: {
      type: String,
      required: true,
    },
    attachment: {
      type: String,
    },
    status: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Ticket = mongoose.model("Ticket", ticketSchema);

export default Ticket;
