import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js";
import sendMail from "../utils/email.js";
import jwt from "jsonwebtoken";
import bcryptjs from "bcryptjs";
import APIFeatures from "../utils/ApiFeatures.js";
import SuperSubadmin, { superSubAdminOTP } from "../models/SuperSubAdmin.js";

export const subAdminLogin = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(new AppError("Email is required", 404));
  }

  const accesesdEmployee = await SuperSubadmin.findOne({ email });

  if (!accesesdEmployee) {
    return res.status(403).json({ message: "You Dont have a access to Login" });
  }

  const otpCode = Math.floor(1000 + Math.random() * 9000);
  const hashedOTP = await bcryptjs.hash(otpCode.toString(), 10);

  await SubAdminOTP.findOneAndUpdate(
    { email },
    { otp: hashedOTP, createdAt: Date.now() },
    { upsert: true }
  );

  await sendMail({
    from: process.env.SMTP_USER,
    to: email,
    subject: "Your OTP for Login",
    text: `Your OTP code is: ${otpCode}`,
  });

  res.status(200).json({
    message: "OTP sent successfully",
  });
});

export const subadminOtpVerify = catchAsync(async (req, res, next) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return next(new AppError("Email and Otp is Required", 404));
  }
  const otpData = await superSubAdminOTP.findOne({ email });

  if (!otpData) {
    return next(new AppError("Otp Expired Or Invalid", 404));
  }
  const isMatch = await bcryptjs.compare(otp, otpData.otp);

  if (!isMatch) {
    return next(new AppError("Invaild Otp"));
  }

  const subAdmin = await SuperSubadmin.findOne({ email });

  const token = jwt.sign(
    { userId: subAdmin._id, email: subAdmin.email },
    process.env.JWT_SECRET,
    {
      expiresIn: "90d",
    }
  );
  res.cookie("usertoken", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 90 * 24 * 60 * 60 * 1000,
  });
  await superSubAdminOTP.deleteOne({ email });

  res.status(200).json({
    message: "User Login Successfully",
    data: {
      token: token,
      subAdmin: subAdmin,
    },
  });
});

export const resendOTP = catchAsync(async (req, res) => {
  const { email } = req.body;
  if (!email) return next(new AppError("Email is required", 404));

  const existingOTP = await superSubAdminOTP.findOne({ email });

  if (existingOTP) {
    const timeElapsed = (Date.now() - existingOTP.createdAt) / 1000;
    if (timeElapsed < 30) {
      return next(new AppError("Please wait before requesting a new OTP", 404));
    }
  }

  const otpCode = Math.floor(1000 + Math.random() * 9000);
  const hashedOTP = await bcryptjs.hash(otpCode.toString(), 10);

  await superSubAdminOTP.findOneAndUpdate(
    { email },
    { otp: hashedOTP, createdAt: Date.now() },
    { upsert: true, new: true }
  );

  await sendMail({
    from: process.env.SMTP_USER,
    to: email,
    subject: "Your Resent OTP for Login",
    text: `Your new OTP code is: ${otpCode}`,
  });

  res.status(200).json({
    message: "OTP resent successfully",
  });
});

export const createSubadmin = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(new AppError("Email is Required", 404));
  }

  const subAdmin = await SuperSubadmin.create(req.body);

  res.status(200).json({
    status: "Success",
    data: {
      subAdmin,
    },
  });
});

export const getAllsubAdmin = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(SuperSubadmin.find(), req.query)
    .filter()
    .sort()
    .limitFields();

  const subAdmin = await features.query;

  res.status(200).json({
    status: "success",
    results: subAdmin.length,
    data: {
      subAdmin,
    },
  });
});

export const getsubAdmin = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const gallery = await SuperSubadmin.findById(id);

  if (!gallery) {
    return next(new AppError("No gallery found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      gallery,
    },
  });
});

// Update a gallery by ID
export const updateSubadmin = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const subadmin = await SuperSubadmin.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!subadmin) {
    return next(new AppError("No Subadmin found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      subadmin,
    },
  });
});

// Delete a gallery by ID
export const deleteSubadmin = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const gallery = await SuperSubadmin.findByIdAndDelete(id);

  if (!gallery) {
    return next(new AppError("No gallery found with that ID", 404));
  }

  res.status(201).json({
    status: "success",
    message: "Subadmin Deleted Successfully",
  });
});

export const getSubadmin = catchAsync(async (req, res, next) => {
  if (req.admin) {
    return next(new AppError("Already Login as Admin", 404));
  }

  const subAdminId = req.subadmin._id;

  const subAdmin = await SuperSubadmin.findById(subAdminId);

  if (!subAdmin) {
    return next(new AppError("User not found", 404));
  }
  res.status(200).json({ subAdmin });
});

export const getPharam = catchAsync(async (req, res) => {
  const data = await SuperSubadmin.find({ access: { $in: ["Pharmacy"] } });

  if (!data) {
    res.status(401).json({
      message: "No Data Found!",
    });
    return;
  }

  res.status(200).json({
    message: "Success",
    data,
  });
});
