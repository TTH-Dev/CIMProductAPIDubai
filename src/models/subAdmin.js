import mongoose from "mongoose";

const subAdminSchema = new mongoose.Schema(
  {
    profileImage: {
      type: String,
    },
    fullName: {
      type: String,
      required: true,
    },
    employeeId:{
      type:String,
      required:true
    },
    age:{
      type:Number
    },
    phone: {
      type: String,
      required: false,
    },
    email: {
      type: String,
      unique: true,
      required: true,
    },
    address: {
      type: String,
    },
    bloodGroup: {
      type: String,
    },
    dateOfJoining: {
      type: Date,
      required: false,
    },
    dateOfBirth: {
      type: Date,
    },
      organizationId: {
      type: String,
      required:true
    },
    
        branch: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Branch",
        },
    position:{
      type:String,
      required:true
    },

    emloyeeType: {
      type: String,
      default: "employee",
    },
    doctorId:{
      type:String
    },

    access: { type: [String] },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

subAdminSchema.methods.createPasswordOtp = function () {
  this.otpCode = Math.floor(1000 + Math.random() * 9000).toString();
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return this.otpCode;
};

subAdminSchema.methods.GenerateOtp = function () {
  this.otp = Math.floor(100000 + Math.random() * 900000).toString();
  return this.otp;
};

const Subadmin = mongoose.model("Subadmin", subAdminSchema);

export default Subadmin;

const subAdminOtpSchema = new mongoose.Schema({
  email: { type: String, required: true },
  otp: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 300 },
});

export const SubAdminOTP = mongoose.model("SubAdminOTP", subAdminOtpSchema);
