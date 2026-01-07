import catchAsync from "../utils/catchAsync.js";
import jwt from 'jsonwebtoken';
import AppError from "../utils/AppError.js";
import WebsiteUser from "../models/websiteUser.js";

const cookieExpireIn = parseInt(process.env.JWT_COOKIE_EXPIRES_IN);

const cookieOptions = {
  expires: new Date(Date.now() + cookieExpireIn * 24 * 60 * 60 * 1000),
  httpOnly: false,
  secure: false,
  sameSite: "none",
};

const jwtSecret = process.env.JWT_SECRET;
const jwtExpiresIn = process.env.JWT_EXPIRES_IN;

const signToken = (id) => {
  return jwt.sign({ id }, jwtSecret, { expiresIn: jwtExpiresIn });
};

export const websiteUserLogin = catchAsync(async (req, res, next) => {
  const { phoneNo } = req.body;

  if (!phoneNo) {
    return next(new AppError("Please provide phone number", 400));
  }

  const user = await WebsiteUser.findOne({ phoneNo });

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  const token = signToken(user._id);

  res.cookie("token", token, cookieOptions);

  res.status(200).json({
    status: "success",
    message: "Login successful",
    token,
    data: {
      user
    }
  });
});


export const websiteUserRegister = catchAsync(async (req, res, next) => {
    const { name, phoneNo } = req.body;
  
    if (!name || !phoneNo) {
      return next(new AppError('Please provide name and phone number', 400));
    }
  
    const existingUser = await WebsiteUser.findOne({ phoneNo });
  
    if (existingUser) {
      return next(new AppError('Phone number already registered', 400));
    }
  
    const newUser = await WebsiteUser.create({ name, phoneNo });
  
    const token = signToken(newUser._id);
  
    res.cookie('token', token, cookieOptions);
  
    res.status(201).json({
      status: 'success',
      message: 'User registered successfully',
      token,
      data: {
        user: newUser,
      },
    });
  });
