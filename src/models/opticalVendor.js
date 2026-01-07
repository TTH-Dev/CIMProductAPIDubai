import mongoose from "mongoose";

const opticalVendorSchema = new mongoose.Schema({
organizationId:{
      type:String,
      required:true
    },
   
        branch: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Branch",
        },
    vendorName: {
        type: String,
        required: true
    },
    accountNumber: {
        type: String
    },
    address: {
        type: String
    },
    city: {
        type: String
    },
    pincode: {
        type: String
    },
    phoneNo: {
        type: String
    },
    contactPersonName: {
        type: String
    },
    emailId: {
        type: String
    }
},
    { timestamps: true });

const OpticalVendor = mongoose.model("OpticalVendor", opticalVendorSchema);
export default OpticalVendor;

