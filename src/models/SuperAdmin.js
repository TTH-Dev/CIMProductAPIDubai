import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const superadminSchema = new mongoose.Schema(
  {
    profileImage: {
      type: String,
    },
    firstname: {
     
      type: String,
    },
    lastname: {
   
      type: String,
    },
    email: {
      type: String,
      unique: true,
      required: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    phoneNo: {
      type: String,
     
    },
    currency:{

    },

    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    otp: String,
    otpCode: String,
  },
  { timestamps: true }
);

superadminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

superadminSchema.pre("save", function (next) {
  if (this.isModified("password") && !this.isNew) {
    this.passwordChangesAt = new Date(Date.now() - 1000);
  }
  next();
});

superadminSchema.methods.comparePassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

superadminSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = this.passwordChangedAt.getTime() / 1000;
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

superadminSchema.methods.createPasswordResetToken = async function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

superadminSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = this.passwordChangedAt.getTime() / 1000;
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

// Add a method to create a password reset token
superadminSchema.methods.createPasswordOtp = function () {
  this.otpCode = Math.floor(1000 + Math.random() * 9000).toString();
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return this.otpCode;
};

// Generate a random OTP for password reset
superadminSchema.methods.GenerateOtp = function () {
  this.otp = Math.floor(100000 + Math.random() * 900000).toString();
  return this.otp;
};

const SuperAdmin = mongoose.model("SuperAdmin", superadminSchema);

export default SuperAdmin;

const superadminOtpSchema = new mongoose.Schema({
  email: { type: String, required: true },
  otp: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 300 },
});

export const SuperAdminOTP = mongoose.model(
  "SuperAdminOTP",
  superadminOtpSchema
);
