import mongoose from "mongoose";    
const productUsageSchema = new mongoose.Schema({

    productId :{ 
        type : mongoose.Schema.Types.ObjectId,
        ref : "Product"
    },
    batchNo : {
        type : String
    },
    producName : {
        type : String
    },
    quantity : {
        type : Number
    },
},{timestamps:true});

const ProductUsage = mongoose.model("ProductUsage", productUsageSchema);
export default ProductUsage;
