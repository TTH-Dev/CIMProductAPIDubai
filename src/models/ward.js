import mongoose from "mongoose";

const bedAllocationReportSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true,
        unique: true
    },
    totalBeds: Number,
    allocatedBeds: Number,
    allocationPercentage: String,
    organizationId:{
      type:String,
      required:true
    },
}, { timestamps: true });

export const BedAllocationReport = mongoose.model("BedAllocationReport", bedAllocationReportSchema);

const bedSchema = new mongoose.Schema({
    occupied: {
        type: Boolean,
        default: false
    },
    organizationId:{
      type:String,
      required:true
    },
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Patient",
        default: null
    },
    inTime: {
        type: String
    },
    outTime: {
        type: String
    },
    allocatedTime: Date,
    bedno : {type : Number}
});

const roomSchema = new mongoose.Schema({
    roomNo: {
        type: Number,
        required: true
    },
    organizationId:{
      type:String,
      required:true
    },
       branch: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "Branch",
            },
    noOfBed: {
        type: Number,
        required: true
    },
    beds: [bedSchema]
});

const wardSchema = new mongoose.Schema({
    floor: {
        type: String,
        enum: ["1stfloor", "2ndfloor"]
    },
    wardType: {
        type: String,
        enum: ["general", "special"]
    },
    organizationId:{
      type:String,
      required:true
    },
    amount : {
        type : Number
    },
    room: [roomSchema]
});

const Ward = mongoose.model("Ward", wardSchema);
export default Ward;
