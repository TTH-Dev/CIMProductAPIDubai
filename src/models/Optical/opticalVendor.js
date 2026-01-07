import mongoose from "mongoose";


const opticalVendorSchema = new mongoose.Schema({

    vendorName: {
        type: String,
        required: true
    },
    vendorType: {
        type: String,
        enum: ["Frame", "Lens"]
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
        type: Number
    },
    phoneNo: {
        type: String
    },
    contactPersonName: {
        type: String
    },
    emailId: {
        type: String
    },
    numProducts : {
        type :Number,
        default:0
    }
},
    { timestamps: true });


const OpticalVendor = mongoose.model("OpticalVendor", opticalVendorSchema);
export default OpticalVendor;

