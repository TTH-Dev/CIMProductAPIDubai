import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js";
import sendMail from "../utils/email.js";
import jwt from "jsonwebtoken";
import bcryptjs from "bcryptjs";
import { SubAdminOTP } from "../models/subAdmin.js";
import Subadmin from "../models/subAdmin.js";
import Doctor from "../models/Doctor.js";
import Employee from "../models/Employees.js";
import dayjs from "dayjs";

export const subAdminLogin = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(new AppError("Email is required", 404));
  }

  const accesesdEmployee = await Subadmin.findOne({ email });
  

if (!accesesdEmployee) {
  return res.status(404).json({ message: "Employee not found" });
}

if (accesesdEmployee.isActive === false) {
  return res.status(403).json({ message: "You don't have access to login" });
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
    text: `
    Hi ${accesesdEmployee.fullName||""},
    
    Your OTP code is: ${otpCode}
    
    Thank You,
    Admin.
    `,
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
  const otpData = await SubAdminOTP.findOne({ email });

  if (!otpData) {
    return next(new AppError("Otp Expired Or Invalid", 404));
  }
  const isMatch = await bcryptjs.compare(otp, otpData.otp);

  if (!isMatch) {
    return next(new AppError("Invaild Otp"));
  }

  const subAdmin = await Subadmin.findOne({ email });

  const token = jwt.sign(
    { userId: subAdmin._id, email: subAdmin.email, position: subAdmin.position },
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
  await SubAdminOTP.deleteOne({ email });

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

  const existingOTP = await SubAdminOTP.findOne({ email });

  if (existingOTP) {
    const timeElapsed = (Date.now() - existingOTP.createdAt) / 1000;
    if (timeElapsed < 30) {
      return next(new AppError("Please wait before requesting a new OTP", 404));
    }
  }

  const otpCode = Math.floor(1000 + Math.random() * 9000);
  const hashedOTP = await bcryptjs.hash(otpCode.toString(), 10);

  await SubAdminOTP.findOneAndUpdate(
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

  const isDr=await Doctor.findOne({emailId:email})

  if(isDr){
    req.body.doctorId=isDr._id
  }

  const subAdmin = await Subadmin.create(req.body);

  await sendMail({
    from: process.env.SMTP_USER,
    to: email,
    subject: "Your account created",
    text: `
    Hi,
    Your account for subadmin login has be created successfully!. 
    Link through ${`https://dashboard.nextgenmed.in`}
    Email: ${email}

    Thank You,
    Admin.
    `,
  });

  res.status(200).json({
    status: "Success",
    data: {
      subAdmin,
    },
  });
});

export const getAllsubAdmin = catchAsync(async (req, res, next) => {
  const id = req.query.orgId;
  if (!id) {
    return next(new AppError("Id not found", 400));
  }
   let filter= {}

  if(req.query.orgId){
    filter.organizationId=req.query.orgId
  }

    if(req.query.branch){
    filter.branch=req.query.branch
  }

  const data = await Subadmin.find(filter)
  


  res.status(200).json({
    status: "success",
    results: data.length,
    data: {
      data,
    },
  });
});

export const getsubAdmin = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const gallery = await Subadmin.findById(id);

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

  if (req.files) {
    if (req.files.profileImage) {
      req.body.profileImage = req.files?.profileImage[0].filename;
    }
  }

  const subadmin = await Subadmin.findByIdAndUpdate(id, req.body, {
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

  const gallery = await Subadmin.findByIdAndDelete(id);

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

  const subAdmin = await Subadmin.findById(subAdminId);

  if (!subAdmin) {
    return next(new AppError("User not found", 404));
  }
  res.status(200).json({ subAdmin });
});

export const getPharam = catchAsync(async (req, res) => {
  const data = await Subadmin.find({ access: { $in: ["Pharmacy"] } });

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


export const getEmpIds = catchAsync(async (req, res, next) => {
  if (!req.query.orgId) {
    return next(new AppError("Need orgId in query", 400));
  }

  let filter = {};

  if (req.query.orgId) {
    filter.organizationId = req.query.orgId;
  }

  if (req.query.branchId) {
    filter.branch = req.query.branchId;
  }

  const doctors = await Doctor.aggregate([
    { $match: filter },
    {
      $project: {
        _id: 0,
        label: "$doctorId",
        value: "$doctorId",   
      },
    },
  ]);


    const teams = await Employee.aggregate([
    { $match: filter },
    {
      $project: {
        _id: 0,
        label: "$empId",
        value: "$empId",   
      },
    },
  ]);


  const data=[...doctors,...teams]

  res.status(200).json({
    status: "success",
    data: data,
  });
});



export const getData=catchAsync(async(req,res,next)=>{
  if(!req.query.id){
    return next(new AppError("Id required",400))
  }
  let data
  if(req.query.id.includes("EMP")){
    const dd=await Employee.findOne({empId:req.query.id})
    console.log(dd,"dd");
       data={
      fullName:dd.name,
      dateOfBirth:dayjs(dd.dob),
      email:dd.email
    }
  }
  else{
    const dd=await Doctor.findOne({doctorId:req.query.id})
    data={
      fullName:dd.doctorName,
      dateOfBirth:dayjs(dd.dateOfBirth),
      email:dd.emailId
    }
    
  }

  res.status(200).json({
    message:"Success",
    data
  })

})
