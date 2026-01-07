import mongoose from "mongoose";
import { StringDecoder } from "string_decoder";

const billingSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },

    treatmentDetail: {
      type: [String],
    },

    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },
    prescribeTestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PrescribeTest",
    },
    UHID: {
      type: String,
    },
    billId: {
      type: String,
    },
    patientName: {
      type: String,
    },
    patientType: {
      type: String,
    },
    status: {
      type: String,
      enum: ["paid", "unpaid"],
      default: "unpaid",
    },
    billAmount: {
      type: Number,
    },
    doctorName: {
      type: String,
    },
    doctorCharge: {
      type: Number,
    },
    billFor: {
      type: String,
      enum: ["opBilling", "ipBilling"],
      default: "opBilling",
    },
    billDetails: [
      {
        categories: {
          type: String,
        },
        serviceName: {
          type: String,
        },
        quantity: {
          type: Number,
        },
        amount: {
          type: Number,
        },
        unitPrice: {
          type: Number,
        },
        tax: {
          type: Number,
        },
        discount: {
          type: Number,
        },
        totalAmount: {
          type: Number,
        },
      },
    ],
    subTotal: {
      type: Number,
    },
    discount: {
      type: Number,
    },
    taxAmount: {
      type: Number,
    },
    total: {
      type: Number,
    },
    paymentDate: {
      type: Date,
      default: Date.now,
    },
    paymentMode: {
      type: String,
    },
    amount: {
      type: Number,
    },
    pendingAmount: {
      type: Number,
    },
    suggestBy: {
      type: String,
      enum: ["doctor", "counsellor"],
    },

    insuranceDetails: {},
  },
  { timestamps: true }
);

billingSchema.pre("save", async function (next) {
  if (!this.billId) {
    const lastVendor = await mongoose
      .model("Billing")
      .findOne({}, {}, { sort: { createdAt: -1 } });

    let nextId = "BILL001";
    if (lastVendor && lastVendor.billId) {
      const lastNumber = parseInt(lastVendor.billId.replace("BILL", ""), 10);
      nextId = `BILL${String(lastNumber + 1).padStart(3, "0")}`;
    }
    this.billId = nextId;
  }
  next();
});

const Billing = mongoose.model("Billing", billingSchema);

export default Billing;
