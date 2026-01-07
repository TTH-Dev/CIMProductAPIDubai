import mongoose from "mongoose";

const supersubAdminSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      unique: true,
      required: true,
    },

    fullName: {
      type: String,
      required:true
    },
    role: {
      type: String,

      default: "Super SubAdmin",
    },

    access: { type: [String] },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

supersubAdminSchema.methods.createPasswordOtp = function () {
  this.otpCode = Math.floor(1000 + Math.random() * 9000).toString();
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return this.otpCode;
};

supersubAdminSchema.methods.GenerateOtp = function () {
  this.otp = Math.floor(100000 + Math.random() * 900000).toString();
  return this.otp;
};

const SuperSubadmin = mongoose.model("SuperSubadmin", supersubAdminSchema);

export default SuperSubadmin;

const SupersubAdminOtpSchema = new mongoose.Schema({
  email: { type: String, required: true },
  otp: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 300 },
});

export const superSubAdminOTP = mongoose.model(
  "SuperSubAdminOTP",
  SupersubAdminOtpSchema
);
