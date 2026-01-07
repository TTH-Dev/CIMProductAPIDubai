import mongoose from "mongoose";

const productUsageMonitorSchema = new mongoose.Schema({
    organizationId:{
      type:String,
      required:true
    },
  
        branch: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Branch",
        },
    productName: {
        type: String,
    },
    openDate: {
        type: Date,
    },
    openTime : {
        type :String
    },
    closeDate: {
        type: Date,
    },
    closeTime : {
        type :String
    },
    reconstituteExpDate: {
        type: Date,
    },
    lotNo: {
        type: String,
    },
    productExpiryDate: {
        type: Date,
    },
    status: {
        type: String,
    },
    testName: {
        type: String,
    },
    monitoredValues: {
            testDate: {
            type: Date,
            },
            testTime : {
                type :String
            },
        currentReading: {
            type: Number,
            },
        mineValue: {
            type: Number,
            },
        lowLevel: {
            type: Number,
            },
        highLevel: {
            type: Number,
            },
        qcRepeatValue: {
            type: Number,
            }
    }
}, { timestamps: true });

const ProductUsageMonitor = mongoose.model("ProductUsageMonitor", productUsageMonitorSchema);

export default ProductUsageMonitor;
