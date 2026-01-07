import mongoose from "mongoose";

const organizationSchema = new mongoose.Schema(
  {
    hospitalName: {
      type: String,
      required: [true, "Hospital name is required"],
      unique: true,
    },
    hospitalType: {
      type: String,
      required: [true, "Hospital type is required"],
    },
    hospitalId: {
      type: String,
    },
    hospitalAddress: {
      type: String,
    },
    planName: {
      type: String,
      required: [true, "Plan name is required"],
    },
    planStartDate: {
      type: Date,
      default: Date.now(),
    },
    planPeriod: {
      type: Number,
      default: 1,
      required: [true, "Plan period is required"],
    },
    autoRepeat: {
      type: Boolean,
      default: false,
    },
    loginCount: {
      type: Number,
      default: 1,
    },
    amount: {
      type: Number,
      default: 0,
    },

    status: {
      type: Boolean,
      default: true,
    },
    paymentStatus: {
      type: String,
      default: "completed",
    },
    paymentDate: {
      type: Date,
      default: Date.now(),
    },

    paymentMode: {
      type: String,
    },
    pastHistory: [
      {
        currentPaymentDate: {
          type: Date,
        },
        lastPaymentDate: {
          type: Date,
        },
        planName: {
          type: String,
        },
        amount: {
          type: Number,
        },
        nextdueDate: {
          type: Date,
        },
        previousDueDate: {
          type: Date,
        },
      },
    ],
    gstNumber: {
      type: String,
    },
    panNumber: {
      type: String,
    },
    tanNumber: {
      type: String,
    },
    websiteLink: {
      type: String,
    },
    organizationContactNo: {
      type: String,
    },
    organizationEmailId: {
      type: String,
    },
    branch: {
      type: Number,
    },
    type: {
      type: String,
    },
    country: {
      type: String,
    },
    trail: {
      type: Boolean,
    },
    organizationWorkingsDays: {
      type: Number,
    },
    organizationTiming: {
      type: String,
    },
    form16ResponsibleUser: {
      type: String,
    },
    form16Signature: {
      type: String,
    },
    salaryStampSignature: {
      type: String,
    },
    organizationLogo: {
      type: String,
    },
    planMonths: {
      type: String,
    },

    smtpuserId: {
      type: String,
      required: true,
    },
    smtpUserEmail: {
      type: String,
      required: true,
    },
    smtpPass: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Organization = mongoose.model("Organization", organizationSchema);
export default Organization;
