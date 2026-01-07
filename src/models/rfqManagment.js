import mongoose from "mongoose";

const rfqManagmentSchmea = new mongoose.Schema(
  {
    organizationId: {
      type: String,
    },
    branch: {
      type: String,
    },
    rfqCode:{
        type:String
    },
    reqListProductID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "pharmacyProductRequest",
    },
    vendorID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PharmacyVendor",
    },
    date: {
      type: Date,
      default: Date.now,
    },
    email: {
      type: String,
    },
    phoneNo: {
      type: String,
    },
    address: {
      type: String,
    },
    quoteDeadLine: {
      type: Date,
    },
    modeOfPay: {
      type: String,
    },
    termsandConditon: {
      type: String,
    },
    items: [
      {
        productID: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "PharmacyProduct",
        },
        totalQty: {
          type: Number,
        },
      },
    ],
  },
  { timestamps: true }
);

const rfqManagment = mongoose.model("rfqManagment", rfqManagmentSchmea);

export default rfqManagment;
