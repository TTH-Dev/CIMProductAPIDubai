import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const adminSchema = new mongoose.Schema(
  {
    profileImage:{
      type:String
    },
    position:{
      type:String
    },
    isBranchSuperAdmin:{
      type:Boolean,
      default:false
    },
    phoneNo:{
      type:String
    },
    adminName: {
      required: true,
      type: String,
    },
    email: {
      type: String,
      unique: true,
      required: true,
    },
    lastActive: {
      type: Date,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },

    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    otp: String,
    otpCode: String,
    timeZone:{
      type:String
    },
    currency:{
      type:String
    },
      branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
    },
  },
  { timestamps: true }
);

adminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

adminSchema.pre("save", function (next) {
  if (this.isModified("password") && !this.isNew) {
    this.passwordChangesAt = new Date(Date.now() - 1000);
  }
  next();
});

adminSchema.methods.comparePassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

adminSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = this.passwordChangedAt.getTime() / 1000;
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

adminSchema.methods.createPasswordResetToken = async function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; 
  return resetToken;
};

adminSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = this.passwordChangedAt.getTime() / 1000;
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

// Add a method to create a password reset token
adminSchema.methods.createPasswordOtp = function () {
  this.otpCode = Math.floor(1000 + Math.random() * 9000).toString();
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return this.otpCode;
};

// Generate a random OTP for password reset
adminSchema.methods.GenerateOtp = function () {
  this.otp = Math.floor(100000 + Math.random() * 900000).toString();
  return this.otp;
};

const Admin = mongoose.model("Admin", adminSchema);

export default Admin;

const adminOtpSchema = new mongoose.Schema({
  email: { type: String, required: true },
  otp: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 300 },
});

export const AdminOTP = mongoose.model("AdminOTP", adminOtpSchema);

const usageAnalyticalSchema = new mongoose.Schema({
  date: { type: String, default: Date.now() },
  moduleName: { type: String },
});

export const usageAnalytical = mongoose.model(
  "usageAnalytical",
  usageAnalyticalSchema
);
