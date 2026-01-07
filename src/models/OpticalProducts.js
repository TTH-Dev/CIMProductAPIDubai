import mongoose from "mongoose";

const opticalProductSchema = new mongoose.Schema({
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
    productName: {
        type: String,
        required: true
    },
    brand: {
        type: String
    },
    status: {
        type: String
    },
    salesTax1: {
        type: String
    },
    salesTax2: {
        type: String
    },
    hsnCode: {
        type: String
    },
    amount: {
        type: String,
        required: true
    },
    cost: {
        type: String
    }
},
    { timestamps: true });


const OpticalProduct = mongoose.model("OpticalProduct", opticalProductSchema);
export default OpticalProduct;

