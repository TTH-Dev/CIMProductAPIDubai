import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js";
import sendMail from "../utils/email.js";
import jwt from "jsonwebtoken";
import bcryptjs from "bcryptjs";
import Employee from "../models/Employees.js";
import Access from "../models/accesesdEmployees.js";
import { OTP } from "../models/Employees.js";

export const checkAccessedEmail = async (email) => {
  const accesesdEmployee = await Access.findOne({ email: email });

  if (!accesesdEmployee) {
    return null;
  }

  return accesesdEmployee;
};

export const employeeLogin = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(new AppError("Email is required", 404));
  }

  const accesesdEmployee = await checkAccessedEmail(email);

  if (!accesesdEmployee) {
    return res.status(403).json({ message: "You Dont have a access to Login" });
  }

  const otpCode = Math.floor(1000 + Math.random() * 9000);
  const hashedOTP = await bcryptjs.hash(otpCode.toString(), 10);

  await OTP.findOneAndUpdate(
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

export const employessOtpVerify = catchAsync(async (req, res, next) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return next(new AppError("Email and Otp is Required", 404));
  }
  const otpData = await OTP.findOne({ email });

  if (!otpData) {
    return next(new AppError("Otp Expired Or Invalid", 404));
  }
  const isMatch = await bcryptjs.compare(otp, otpData.otp);

  if (!isMatch) {
    return next(new AppError("Invaild Otp"));
  }

  const accesesdEmployee = await checkAccessedEmail(email);

  const data = {
    email: accesesdEmployee.email,
    type: accesesdEmployee.type,
    accessModules: accesesdEmployee.accessModules,
  };

  let employee = await Employee.findOne({ email });
  if (!employee) {
    employee = new Employee(data);
    await employee.save();
  }

  const token = jwt.sign(
    { userId: employee._id, email: employee.email },
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
  await OTP.deleteOne({ email });

  res.status(200).json({
    message: "User Login Successfully",
    data: {
      token: token,
      employee: employee,
    },
  });
});

export const resendOTP = catchAsync(async (req, res) => {
  const { email } = req.body;
  if (!email) return next(new AppError("Email is required", 404));

  const existingOTP = await OTP.findOne({ email });

  if (existingOTP) {
    const timeElapsed = (Date.now() - existingOTP.createdAt) / 1000;
    if (timeElapsed < 30) {
      return next(new AppError("Please wait before requesting a new OTP", 404));
    }
  }

  const otpCode = Math.floor(1000 + Math.random() * 9000);
  const hashedOTP = await bcryptjs.hash(otpCode.toString(), 10);

  await OTP.findOneAndUpdate(
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

export const createEmployee = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(new AppError("Email is Required", 404));
  }

  if (req.file) {
    req.body.image = req.file.filename;
  }

  const employee = await Employee.create(req.body);

  res.status(200).json({
    status: "Success",
    data: {
      employee,
    },
  });
});

export const getAllEmployee = catchAsync(async (req, res, next) => {
  const limit = parseInt(req.query.limit) || 10;
  const page = parseInt(req.query.page) || 1;
  const skip = (page - 1) * limit;
  const filter = {};
  if (req.query.id) {
    filter.organizationId = req.query.id;
  }

    if(req.query.branchId){
    filter.branch=req.query.branchId
  }

  if(req.query.name){
    filter.name=req.query.name
  }
if (req.query.roleType) {
  filter.roleType = req.query.roleType.toLowerCase();
}

  const totalCount = await Employee.countDocuments(filter);
  const employee = await Employee.find(filter)
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  const totalPages = Math.ceil(totalCount / limit);

  res.status(200).json({
    status: "success",
    currentPage: page,
    totalPages,
    totalCount,
    pageSize: limit,
    data: {
      employee,
    },
  });
});

export const getAllEmployeeDrp = catchAsync(async (req, res, next) => {
  if (!req.query.id) {
    return next(new AppError("OrgId required!", 400));
  }
  const filter = {};
  if (req.query.id) {
    filter.organizationId = req.query.id;
  }
  if (req.query.roleType) {
    filter.roleType = req.query.roleType;
  }

    if(req.query.branchId){
    filter.branch=req.query.branchId
  }

  const data = await Employee.find(filter);

  const ffDrp = data.map((val) => ({
    label: val?.name,
    value: val?.name,
  }));

  res.status(200).json({
    message: "Success",
    ffDrp,
  });
});

export const updateEmployee = catchAsync(async (req, res, next) => {
  const empId = req.query.id;

  if (!empId) {
    return next(new AppError("EmpId is Required", 404));
  }

  if (req.file) {
    req.body.image = req.file.filename;
  }

  const employee = await Employee.findByIdAndUpdate(empId, req.body, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    status: "Success",
    data: {
      employee,
    },
  });
});

export const getByIdEmployee = catchAsync(async (req, res, next) => {
  const id = req.query.id;

  const employee = await Employee.findById(id).populate("branch");

  if (!employee) {
    return next(new AppError("No employee found!", 401));
  }

  res.status(200).json({
    status: "Success",
    data: {
      employee,
    },
  });
});

export const deleteEmp = catchAsync(async (req, res) => {
  const id = req.query.id;

  const data = await Employee.findOneAndDelete(id);

  res.status(200).json({
    message: "Success",
    data,
  });
});


export const updateEmprelive = catchAsync(async (req, res, next) => {
  const { id } = req.query;

  if (!id) {
    return next(new AppError("EmpId not found in query", 400));
  }
  const updateData = { ...req.body };

  if (req.files) {
    if (req.files.resignationLetter) {
      updateData.resignationLetter = req.files.resignationLetter[0].filename;
    }

    if (req.files.confirmationLetter) {
      updateData.confirmationLetter = req.files.confirmationLetter[0].filename;
    }

    if (req.files.relievingLetter) {
      updateData.relievingLetter =
        req.files.relievingLetter[0].filename;
    }

       if (req.files.expCertificate) {
      updateData.expCertificate =
        req.files.expCertificate[0].filename;
    }
  }

  const updatedemp = await Employee.findByIdAndUpdate(
    id,
    {...updateData,isRelieved:true},
    {
      new: true,
      runValidators: true,
    }
  );

  if (!updatedemp) {
    return next(new AppError("Emp not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: { updatedemp },
  });
});


export const getMultiDrp=catchAsync(async(req,res,next)=>{
  const {orgId,branch}=req.query

  
  if (!orgId) {
    return next(new AppError("orgId not found in query", 400));
  }

  let filter={
    organizationId:orgId
  }

  if(branch){
    filter.branch=branch
  }


const data = await Employee.aggregate([
  {
    $match: filter
  },
  {
    $group: {
      _id: null,
      empId: {
        $addToSet: {
          label: "$empId",
          value: "$empId"
        }
      },
      name: {
        $addToSet: {
          label: "$name",
          value: "$name"
        }
      },  roleType: {
        $addToSet: {
          label: "$roleType",
          value: "$roleType"
        }
      }
    }
  },
  {
    $project: {
      _id: 0
    }
  }
]);




res.status(200).json({
  message:"Success",
  data
})

})