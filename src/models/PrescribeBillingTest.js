import mongoose from "mongoose";

const PrescribeBillinTestgSchema = new mongoose.Schema(
    {
        patientId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Patient",
            required: true,
        },
        UHID : {
            type : String,
        },
        billId: {
            type: String,
        },
        patientName: {
            type: String,
        },
        patientType: {
            type: String,
        },
        status: {
            type: String,
            enum: ["Paid", "Unpaid"],
            default: "Unpaid",
        },
        billAmount: {
            type: Number,
        },
        billDetails: [
            {
                serviceName: {
                    type: String,
                },
                quantity: {
                    type: Number,
                },
                amount: {
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
        taxAmount: {
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
        insuranceDetails: {},
    },
    { timestamps: true }
);

PrescribeBillinTestgSchema.pre("save", async function (next) {
    if (!this.billId) {
        const lastVendor = await mongoose.model("PrescribeBillingTest").findOne({}, {}, { sort: { createdAt: -1 } });

        let nextId = "PRTBILL001"; 
        if (lastVendor && lastVendor.billId) {
            const lastNumber = parseInt(lastVendor.billId.replace("PRTBILL", ""), 10);
            nextId = `PRTBILL${String(lastNumber + 1).padStart(3, "0")}`;
        }
        this.billId = nextId;
    }
    next();
});

const PrescribeBillingTest = mongoose.model("PrescribeBillingTest", PrescribeBillinTestgSchema);

export default PrescribeBillingTest;


