import mongoose from "mongoose";
const manualbillingSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },
    organizationId:{
      type:String,
      required:true
    },

        branch: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Branch",
        },
    date: {
      type: Date,
    },
    phoneNo: {
      type: String,
    },
  
    billId: {
      type: String,
    },
    billedById: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subadmin",
    },
    areaLocation: {
      type: String,
    },

    status: {
      type: String,
      default: "paid",
    },

    billDetails: [
      {
        categories: {
          type: String,
        },
     
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "PharmacyProduct",
          required: true,
        },
        batchNo: {
          type: String,
        },
        quantity: {
          type: Number,
        },
        mrp: {
          type: Number,
        },
        unit:{
          type:String,
        },
        taxamount: {
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
  },
  { timestamps: true }
);

manualbillingSchema.pre("save", async function (next) {
  if (!this.billId) {
    const lastVendor = await mongoose
      .model("manualBilling")
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

const ManualBilling = mongoose.model("manualBilling", manualbillingSchema);

export default ManualBilling;
