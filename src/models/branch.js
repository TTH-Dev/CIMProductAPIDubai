import mongoose from "mongoose";

const branchSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    branchName: {
      type: String,
      required:[true,"Branch name is required"],
      unique:true
    },
    address: {
      type: String,
    },
    subAdminCount: {
      type: Number,
      default: 0,
    },
    branchAdmin: {
      type: mongoose.Schema.Types.ObjectId,
      ref:"Admin",
      required: [true,"Branch Admin required"],
    },
    branchAccess: {
      type: Array,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Branch = mongoose.model("Branch", branchSchema);

export default Branch;
