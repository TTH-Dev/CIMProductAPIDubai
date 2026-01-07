import catchAsync from "../utils/catchAsync.js";
import jwt from "jsonwebtoken";
import AppError from "../utils/AppError.js";
import Admin, { AdminOTP, usageAnalytical } from "../models/admin.js";
import sendEmail from "../utils/email.js";
import Subadmin from "../models/subAdmin.js";
import dayjs from "dayjs";
import Organization from "../models/oraganization.js";
import SuperAdmin from "../models/SuperAdmin.js";

const cookieExpireIn = parseInt(process.env.JWT_COOKIE_EXPIRES_IN);

const cookieOptions = {
  expires: new Date(Date.now() + cookieExpireIn * 24 * 60 * 60 * 1000),
  httpOnly: false,
  secure: false,
  sameSite: "none",
};

const jwtsecret = process.env.JWT_SECRET;

const jwtExpiresIn = process.env.JWT_EXPIRES_IN;

const signToken = (id,role) => {
  return jwt.sign({ id , position:role,userId:id }, jwtsecret, { expiresIn: jwtExpiresIn });
};

export const adminSignup = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError("Please provide an email and password", 400));
  }

  const existingAdmin = await Admin.findOne({ email });

  if (existingAdmin) {
    return next(new AppError("Admin with this email already exists", 400));
  }

  const newUser = await Admin.create(req.body);
  
  const token = signToken(newUser._id);

  res.cookie("token", token, cookieOptions);

  res.status(201).json({
    status: "success",
    message: "Admin registered successfully",
  });
});

export const adminLogin = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError("Please provide an email and password", 400));
  }

  const user = await Admin.findOne({ email }).select("+password");
  if (!user) {
    return next(new AppError("User not found", 404));
  }

  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    return next(new AppError("Invalid password", 401));
  }
  user.lastActive = Date.now();
  await user.save({ validateBeforeSave: false });
  const token = signToken(user._id,"Admin");

  res.cookie("token", token, cookieOptions);

  res.status(200).json({
    message: "Login successful",
    user,
    token,
  });
});

export const forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  const admin = await Admin.findOne({ email });
  if (!admin) {
    return next(new AppError("Admin not found", 404));
  }

  const OTP = admin.createPasswordOtp();
  await admin.save({ validateBeforeSave: false });

  await AdminOTP.findOneAndUpdate(
    { email },
    { otp: OTP, createdAt: Date.now() },
    { upsert: true }
  );

  const message = `Hi,
  
  Forgot your password? Your one-time password is ${OTP}.
  
  Thank You`;
  await sendEmail({
    from: process.env.SMTP_USER,
    to: req.body.email,
    subject: "Password Reset OTP",
    text: message,
  });

  res.status(200).json({
    message: "OTP sent to email",
  });
});

export const otpValidation = catchAsync(async (req, res, next) => {
  const { email, otpCode } = req.body;

  if (!email || !otpCode) {
    return next(new AppError("Email and Otp is Required", 404));
  }

  const otpData = await AdminOTP.findOne({ email });

  if (!otpData) {
    return res
      .status(400)
      .json({ message: "Otp Not Generated for this Login" });
  }

  if (otpData.otp !== otpCode) {
    return res.status(400).send("Invalid OTP");
  }

  res.status(200).json({ message: "OTP is valid", email });
});

export const resetPassword = catchAsync(async (req, res, next) => {
  const { newPassword, email } = req.body;

  const otpData = await AdminOTP.findOne({ email });

  if (!otpData) {
    return next(new AppError("OTP expired", 400));
  }

  if (!email) {
    return next(new AppError("Email not found or OTP expired", 400));
  }

  const admin = await Admin.findOne({ email });
  if (!admin) {
    return next(new AppError("admin not found", 404));
  }

  admin.password = newPassword;
  await admin.save();

  await AdminOTP.deleteOne({ email });

  res.status(200).json({ message: "Password has been reset successfully" });
});

export const updatePassword = catchAsync(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  const admin = await Admin.findById(req.user && req.user._id).select(
    "+password"
  );
  if (!admin) {
    return next(new AppError("admin not found", 404));
  }

  const isPasswordValid = await admin.comparePassword(currentPassword);
  if (!isPasswordValid) {
    return next(new AppError("Invalid password", 401));
  }
  admin.password = newPassword;
  await admin.save();
  res.status(200).json({ message: "Password update successful" });
});

export const updateAdmin = catchAsync(async (req, res, next) => {
  
  const id = req.admin._id;

  if (req.files) {
    if (req.files.profileImage) {
      req.body.profileImage = req.files?.profileImage[0].filename;
    }
  }

  const admin = await Admin.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!admin) {
    return next(new AppError("No Admin found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      admin,
    },
  });
});

export const logoutAdmin = (req, res) => {
  try {
    res.clearCookie("token", { httpOnly: true, secure: true });
    return res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.error("Error during logout:", error);
    res.status(500).json({ message: "Failed to log out" });
  }
};

export const protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({ message: "Not authorized, no token" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    let user =
      (await Admin.findById(decoded.id)) ||
      (await SuperAdmin.findById(decoded.id));

    if (user) {
      req.admin = user;
      req.role = user.role || "admin";
    } else {
      user =
        (await Subadmin.findById(decoded.userId)) ||
        (await SuperAdmin.findById(decoded.userId));

      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      if (user.__t === "Supersubadmin") {
        req.supersubadmin = user;
        req.role = "supersubadmin";
      } else {
        req.subadmin = user;
        req.role = "subadmin";
      }
    }

    next();
  } catch (error) {
    console.error("Authorization error:", error);
    res.status(401).json({ message: "Not authorized" });
  }
};

export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.admin.role)) {
      return res
        .status(403)
        .json({ message: "You do not have permission to perform this action" });
    }
    next();
  };
};

export const getMe = catchAsync(async (req, res, next) => {
  const user = req.admin || req.superadmin || req.subadmin || req.supersubadmin;

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  res.status(200).json({
    status: "success",
    role: req.role,
    data: { user },
  });
});

export const createUsageAnalytical = catchAsync(async (req, res) => {
  const data = await usageAnalytical.create(req.body);

  res.status(200).json({
    message: "Success",
    data,
  });
});

export const getAllUsageAnalytical = catchAsync(async (req, res) => {
  const { type } = req.query;

  const filter = {};

  const today = dayjs().startOf("day").toDate();

  if (type === "Today") {
    filter.date = {
      $gte: today,
      $lte: dayjs().endOf("day").toDate(),
    };
  } else if (type === "Weekly") {
    filter.date = {
      $gte: dayjs().startOf("week").toDate(),
      $lte: dayjs().endOf("week").toDate(),
    };
  } else if (type === "Yearly") {
    filter.date = {
      $gte: dayjs().startOf("year").toDate(),
      $lte: dayjs().endOf("year").toDate(),
    };
  }

  const data = await usageAnalytical.find(filter);

  res.status(200).json({
    message: "Retrived successfully!",
    data,
  });
});

export const homeData = catchAsync(async (req, res) => {
  const { type } = req.query;

  const filter = {};

  const today = dayjs().startOf("day").toDate();

  if (type === "Today") {
    filter.createdAt = {
      $gte: today,
      $lte: dayjs().endOf("day").toDate(),
    };
  } else if (type === "Weekly") {
    filter.createdAt = {
      $gte: dayjs().startOf("week").toDate(),
      $lte: dayjs().endOf("week").toDate(),
    };
  } else if (type === "Yearly") {
    filter.createdAt = {
      $gte: dayjs().startOf("year").toDate(),
      $lte: dayjs().endOf("year").toDate(),
    };
  }
  const totalHospital = await Organization.countDocuments();
  const filteredHospitals = await Organization.countDocuments(filter);
  const totalAdmin = await Admin.countDocuments(filter);
  const totalSubAdmin = await Subadmin.countDocuments(filter);
  const totalActiveHospital = await Organization.countDocuments({
    ...filter,
    status: true,
  });

  const value = {
    totalHospital,
    filteredHospitals,
    totalAdmin,
    totalSubAdmin,
    totalActiveHospital,
    totalInActiveHospital: totalHospital - totalActiveHospital,
  };

  const data = await Organization.aggregate([
    {
      $group: {
        _id: { $month: "$createdAt" },
        count: { $sum: 1 },
      },
    },
    {
      $sort: { _id: 1 },
    },
  ]);

  const total = data.reduce((sum, item) => sum + item.count, 0);

  const monthNames = [
    "",
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const formattedData = data.map((d) => ({
    month: monthNames[d._id],
    count: d.count,
    percentage: total > 0 ? +((d.count / total) * 100).toFixed(2) : 0,
  }));

  res.status(200).json({
    message: "Success",
    value,
    type,
    formattedData,
  });
});

export const getAllAdmin = catchAsync(async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const page = parseInt(req.query.page) || 1;
  const skip = (page - 1) * limit;
  const data = await Admin.find()
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 })
    .populate("organizationId");

  const totalRecords = await Admin.countDocuments();
  const totalPages = Math.ceil(totalRecords / limit);

  res.status(200).json({
    message: "Success",
    data,
    totalPages,
  });
});

export const getAdminById = catchAsync(async (req, res, next) => {
  const id = req.query.id;
  const data = await Admin.findById(id);

  if (!data) {
    return next(new AppError("Admin not found", 404));
  }

  res.status(200).json({
    message: "Admin details",
    data,
  });
});
