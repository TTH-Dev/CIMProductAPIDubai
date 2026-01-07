import mongoose from "mongoose";

const opticalBillingSchema = new mongoose.Schema({
    billData: [{
        barCode: {
            type: String
        },
        productName: {
            type: String
        },
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "OpticalProduct"
        },
        quantity: {
            type: Number
        },
        color:{
            type:String
        },
        type:{
            type:String
        },
        rate: {
            type: Number
        },
        discount: {
            type: Number
        },
        totalAmount: {
            type: Number
        },
    }],
    subTotal: {
        type: Number
    },
    discount: {
        type: Number
    },
    total: {
        type: Number
    },
    date: {
        type: Date,
        default: Date.now
    },
    mode: {
        type: String,
        enum: ["Cash", "Upi", "Card", "Cheque"],
    },
    amount: {
        type: Number
    },
    pendingAmount: {
        type: Number
    },
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Patient",
        required: true
    },
    enteredDate: {
        type: Date,
        default: Date.now
    },
    billNo : {
        type : String,
        unique : true
    }
}, { timestamps: true });

opticalBillingSchema.pre("save", async function (next) {
  if (!this.billNo) {
    const lastBill = await mongoose
      .model("OpticalBilling")
      .findOne({}, {}, { sort: { createdAt: -1 } });

    let prefix = "OSBILL";
    let nextNumber = 1;

    if (lastBill?.billNo) {
      const match = lastBill.billNo.match(/\d+$/); 
      if (match) {
        nextNumber = parseInt(match[0], 10) + 1;
      }
    }

    this.billNo = `${prefix}${String(nextNumber).padStart(4, "0")}`; 
  }
  next();
});



const OpticalBilling = mongoose.model("OpticalBilling", opticalBillingSchema);
export default OpticalBilling;