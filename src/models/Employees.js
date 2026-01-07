import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema(
  {
        image: {
      type: String,
    },
    name: {
      type: String,
      required: true,
    },

    dob: {
      type: Date,
      required: true,
    },
    bloodGroup: {
      type: String,
      required: true,
    },
    organizationId: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: false,
    },
    email: {
      type: String,
      required: true,
    },
    roleType: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    dateOfJoining: {
      type: Date,
      required: true,
    },
    empId: {
      type: String,
    },
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
    },
    phoneNo:{
      type:String,
     required: true,
    },
    resignationLetter:{
      type:String
    },
    resignationDate:{
      type:Date
    },
    lastworkingDate:{
      type:Date
    },
    noticeperiodDuration:{
      type:String
    },
    reasonforExit:{
      type:String
    },
    confirmationLetter:{
      type:String
    },
    relievingLetter:{
      type:String
    },
    expCertificate:{
      type:String
    },
    empFeedback:{
      type:String
    },
    workRating:{
      type:Number
    },
    suggestCompany:{
      type:String
    },
    isRelieved:{
      type:Boolean,
      default:false
    }

  },
  { timestamps: true }
);

employeeSchema.pre("save", async function (next) {
  if (!this.empId) {
    const lastVendor = await mongoose
      .model("Employee")
      .findOne({}, {}, { sort: { createdAt: -1 } });

    let nextId = "EMP001";
    if (lastVendor && lastVendor.empId) {
      const lastNumber = parseInt(lastVendor.empId.replace("EMP", ""), 10);
      nextId = `EMP${String(lastNumber + 1).padStart(3, "0")}`;
    }
    this.empId = nextId;
  }

  next();
});

const Employee = mongoose.model("Employee", employeeSchema);

export default Employee;

const otpSchema = new mongoose.Schema({
  email: { type: String, required: true },
  otp: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 300 },
});

export const OTP = mongoose.model("OTP", otpSchema);
