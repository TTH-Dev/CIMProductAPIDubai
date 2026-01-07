import mongoose from "mongoose";

const UserAnalysisSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
       branch: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "Branch",
            },
    moduleName: String,
    timeSpent: Number,
  },
  { timestamps: true }
);

const UserAnalysis = mongoose.model("userAnalysis", UserAnalysisSchema);
export default UserAnalysis;
