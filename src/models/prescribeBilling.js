import mongoose from "mongoose";

const PrescribeBillingSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
   
        branch: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Branch",
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
      enum: ["Paid", "Unpaid"],
      default: "Unpaid",
    },
    billAmount: {
      type: Number,
    },
    billDetails: [
      {
        medicineName: {
          type: String,
        },
        medicineType: {
          type: String,
        },
        quantity: {
          type: Number,
        },
        quantityType: {
          type: String,
        },
        amount: {
          type: Number,
        },
        taxAmount: {
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
    prescriptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Prescription",
      required: true,
    },
    insuranceDetails: {},
    prescribePDF: {
      type: String,
    },
    prescriptionFor: {
      type: String,
      enum: ["op", "ip","ap"],
      default: "op",
    },
    followUpCheckup: {},
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
    },
    medicine: [],
  },
  { timestamps: true }
);

PrescribeBillingSchema.pre("save", async function (next) {
  if (!this.billId) {
    const lastVendor = await mongoose
      .model("PrescribeBilling")
      .findOne({}, {}, { sort: { createdAt: -1 } });

    let nextId = "PRBILL001";
    if (lastVendor && lastVendor.billId) {
      const lastNumber = parseInt(lastVendor.billId.replace("PRBILL", ""), 10);
      nextId = `PRBILL${String(lastNumber + 1).padStart(3, "0")}`;
    }
    this.billId = nextId;
  }
  next();
});

const PrescribeBilling = mongoose.model(
  "PrescribeBilling",
  PrescribeBillingSchema
);

export default PrescribeBilling;
