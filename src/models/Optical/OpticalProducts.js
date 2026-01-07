import mongoose from "mongoose";

const opticalProductSchema = new mongoose.Schema({

    vendorName: {
        type: String,
        required: true
    },
    productName: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ["Frame", "Lens"]
    },
    brand: {
        type: String
    },
    status: {
        type: String
    },
    salesTax1: {
        type: Number
    },
    salesTax2: {
        type: Number
    },
    hsnCode: {
        type: String
    },
    amount: {
        type: Number,
        required: true
    },
    cost: {
        type: Number
    },
    barcode: {
        type: String
    },
    stocks: {
        type: Number,
        default:0
    },
    frameStockandcolors:{
        frames:[{
            color:{
                type:String
            },
            stock:{
                type:Number
            }
        }]
    },
    availlableStocksStatus: {
        type: String,
        enum: ["Available", "Sold"],
       
    },
    productType: {
        type: String
    },
    productMaterial: {
        type: String
    },
},
    { timestamps: true });


const OpticalProduct = mongoose.model("OpticalProduct", opticalProductSchema);
export default OpticalProduct;

