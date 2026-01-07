import mongoose from "mongoose";

const opticalPurchaseSchema = new mongoose.Schema({
    vendor: {
        type: String,
        required: true
    },
    vendorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "OpticalVendor"
    },
    products: [
        {
            vendor: {
                type: String,
                required: true
            },
            vendorId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "OpticalVendor"
            },
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "OpticalProduct"
            },
            productName: {
                type: String,
            },
            quantity: {
                type: Number,
            },
            rate: {
                type: Number,
            },
            units: {
                type: String,
            },
            mrp: {
                type: Number,
            },
            taxAmt: {
                type: Number,
            }
        }
    ],
    subTotal: {
        type: Number,
        required: true
    },
    taxAmt: {
        type: Number,
        required: true
    },
    total: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ["Requested", "Accepted", "Recieved", "Rejected"],
        default: "Requested"
    },
    date: {
        type: Date,
        default: Date.now
    },
    opticalPurchaseNo: {
        type: String,
        unique: true
    }
}, { timestamps: true });

opticalPurchaseSchema.pre("save", async function (next) {
    if (!this.opticalPurchaseNo) {
        const lastVendor = await mongoose.model("OpticalPurchase").findOne({}, {}, { sort: { createdAt: -1 } });

        let nextId = "OTPH001";
        if (lastVendor && lastVendor.opticalPurchaseNo) {
            const lastNumber = parseInt(lastVendor.opticalPurchaseNo.replace("OTPH001", ""), 10);
            nextId = `OTPH001${String(lastNumber + 1).padStart(3, "0")}`;
        }
        this.opticalPurchaseNo = nextId;
    }
    next();
});

const OpticalPurchase = mongoose.model("OpticalPurchase", opticalPurchaseSchema);
export default OpticalPurchase;
