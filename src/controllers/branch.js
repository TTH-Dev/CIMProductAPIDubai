import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js";
import Branch from "../models/branch.js";
import Patient from "../models/patient.js";
import Employee from "../models/Employees.js";
import Doctor from "../models/Doctor.js";
import OutPatient from "../models/outPatient.js";
import Appointment from "../models/appointment.js";
import Admin from "../models/admin.js";
import sendEmail from "../utils/email.js";
import crypto from "crypto";
import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
} from "date-fns";
import Prescription from "../models/Prescription.js";
import NurseStation from "../models/nursingStation.js";
import mongoose from "mongoose";
import SubAdmin from "../models/subAdmin.js";
import Billing from "../models/billing.js";
import PrescribeBilling from "../models/prescribeBilling.js";

export const createBranch = catchAsync(async (req, res, next) => {
  if (!req.body.organizationId) {
    return next(new AppError("organizationId is required!", 400));
  }

  const { branchAdmin } = req.body;

  if (!branchAdmin) {
    return next(new AppError("Please provide branchAdmin", 400));
  }

  const existingAdmin = await Admin.findOne({ email: branchAdmin });

  if (existingAdmin) {
    return next(new AppError("Admin with this email already exists", 400));
  }
  const plainPassword = crypto.randomBytes(4).toString("hex");

  const adminData = {
    email: req.body.branchAdmin,
    adminName: req.body.branchName,
    password: plainPassword,
    organizationId:req.body.organizationId
  };

  const newUser = await Admin.create(adminData);

  const payload = { ...req.body, branchAdmin: newUser._id };

  const branchData = await Branch.create(payload);


  if(branchData){
    newUser.branch=branchData._id

    await newUser.save()
  }

  const message = `
  Hi,

  Your admin account has been created.

  Login details:
  Branch:${req.body.branchName}
  Email:${branchAdmin}
  Password:${plainPassword}
  
  Thank You,
  Super Admin
  `;

  await sendEmail({
    from: process.env.SMTP_USER,
    to: branchAdmin,
    subject: "Account Created",
    text: message,
  });

  res.status(200).json({
    message: "Branch created successfully",
    branchData,
    newUser,
  });
});

export const getAllBranch = catchAsync(async (req, res, next) => {
  let filter = {};

  if (req.query.branchName) {
    filter._id = req.query.branchName;
  }

  if (req.query.adminName) {
    const admin = await Admin.findOne({
      adminName: { $regex: req.query.adminName, $options: "i" },
    });

    if (admin) {
      filter.branchAdmin = admin._id;
    }
  }

  if (req.query.organizationId) {
    filter.organizationId = req.query.organizationId;
  }

  const limit = req.query.limit || 10;
  const page = req.query.page || 1;
  const skip = (page - 1) * limit;

  const data = await Branch.find(filter)
    .populate("branchAdmin")
    .limit(limit)
    .skip(skip)
    .sort({ createdAt: -1 });

  const totalDocuments = await Branch.countDocuments(filter);

  const totalPages = Math.ceil(totalDocuments / limit);

  res.status(200).json({
    message: "Success",
    totalPages,
    page,
    data,
  });
});

export const getBranchById = catchAsync(async (req, res, next) => {
  if (!req.query.id) {
    return next(new AppError("Id not passed in query!", 400));
  }
  const data = await Branch.findOne({ _id: req.query.id }).populate(
    "branchAdmin"
  );

  if (!data) {
    return next(new AppError("Branch not found!", 401));
  }

  res.status(200).json({
    message: "Success",
    data,
  });
});

export const updateBranchById = catchAsync(async (req, res, next) => {
  if (!req.query.id) {
    return next(new AppError("Id not passed in query!", 400));
  }

  const data = await Branch.findByIdAndUpdate(req.query.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    message: "Updated Successfully",
    data,
  });
});

export const deleteBranchById = catchAsync(async (req, res, next) => {
  if (!req.query.id) {
    return next(new AppError("Id not passed in query!", 400));
  }

  const getBrach=await Branch.findOne({_id:req.query.id})

  const admin= await Admin.findByIdAndDelete(getBrach.branchAdmin)

  const data = await Branch.findByIdAndDelete(req.query.id);




  res.status(200).json({
    message: "Deleted Successfully",
    data,
    admin
  });
});

export const branchOverView = catchAsync(async (req, res, next) => {

  const { branchId, orgId } = req.query;

  if (!orgId) {
    return next(new AppError("orgId missing in query!", 400));
  }

  let filter = {};
  if (branchId) {
    filter.branch = new mongoose.Types.ObjectId(branchId);
  }
  if (orgId) {
    filter.organizationId = orgId;
  }
let drFilter={}
  if(req.query.doctorName){
    drFilter.doctorName=req.query.doctorName
  }
  let drIdFilter={}
  if(req.query.doctorId){
    drIdFilter.doctorId=new mongoose.Types.ObjectId(req.query.doctorId);
  }
 
  const twoDaysAgo = new Date();
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
  const totalPatient = await Patient.countDocuments(filter);

  const startOfDay = new Date();
startOfDay.setHours(0, 0, 0, 0);

const endOfDay = new Date();
endOfDay.setHours(23, 59, 59, 999);

  const newPatient = await Patient.countDocuments({
    ...filter,
    createdAt: { $gte: twoDaysAgo, $lte: new Date() },
  });

  const oldPatient = totalPatient - newPatient;

  const totalTeam = await Employee.countDocuments(filter);

  const totalDoctor = await Doctor.countDocuments(filter);
  const todayTotalPatient=await Patient.countDocuments({...filter, ...drIdFilter ,createdAt: { $gte: startOfDay, $lte: endOfDay }})
  const outPatientTotal=await OutPatient.countDocuments({...filter, ...drFilter, createdAt: { $gte: startOfDay, $lte: endOfDay }})
  const appointmentPatientTotal=await Appointment.countDocuments({...filter,...drFilter,  createdAt: { $gte: startOfDay, $lte: endOfDay }})
  const totalStaff = totalTeam + totalDoctor;


  const totalOPwaaiting=await OutPatient.countDocuments({...filter, ...drFilter,createdAt: { $gte: startOfDay, $lte: endOfDay },queueStatus:"waiting"})
    const totalAPwaaiting=await Appointment.countDocuments({...filter, ...drFilter,createdAt: { $gte: startOfDay, $lte: endOfDay },queueStatus:"waiting"})
  const totalWaiting=totalOPwaaiting+totalAPwaaiting


   const totalOPengage=await OutPatient.countDocuments({...filter,...drFilter, createdAt: { $gte: startOfDay, $lte: endOfDay},queueStatus:"engaged"})
    const totalAPengage=await Appointment.countDocuments({...filter,...drFilter, createdAt: { $gte: startOfDay, $lte: endOfDay },queueStatus:"engaged"})
  const totalengage=totalOPengage+totalAPengage


     const totalOPcomplete=await OutPatient.countDocuments({...filter,...drFilter, createdAt: { $gte: startOfDay, $lte: endOfDay },queueStatus:"completed"})
    const totalAPcomplete=await Appointment.countDocuments({...filter, ...drFilter,createdAt: { $gte: startOfDay, $lte: endOfDay },queueStatus:"completed"})
  const totalcomplete=totalOPcomplete+totalAPcomplete
    const totalAPReschedule=await Appointment.countDocuments({...filter, ...drFilter,createdAt: { $gte: startOfDay, $lte: endOfDay },isRescheduled:true})

    const bills=await Billing.find({...filter,...drFilter})
const totalBillAmount = bills.reduce((acc, val) => {
  const total = val?.total ?? 0;
  const doctorCharge = val?.doctorCharge ?? 0;
  return acc + total + doctorCharge;
}, 0);

const prescBills=await PrescribeBilling.find({...filter,...drIdFilter})
const totalPrescBillAmount = prescBills.reduce((acc, bill) => {
  return acc + (bill?.billAmount ?? 0);
}, 0);


const totalRevenue=totalBillAmount+totalPrescBillAmount


  res.status(200).json({
    message: "Success",
    totalDoctor,
    totalPatient,
    totalTeam,
    totalStaff,
    newPatient,
    oldPatient,
    outPatientTotal,
    appointmentPatientTotal,
    todayTotalPatient,
    totalWaiting,
    totalengage,
    totalcomplete,
    totalAPReschedule,totalRevenue,totalBillAmount,totalPrescBillAmount
  });
});

export const getBranchStaff = catchAsync(async (req, res, next) => {
  const { branchId, orgId } = req.query;

  if (!branchId || !orgId) {
    return next(new AppError("branchId or orgId missing in query!", 400));
  }
  let filter = {};
  if (branchId) {
    filter.branch = branchId;
  }
  if (orgId) {
    filter.organizationId = orgId;
  }

  const teamData = await Employee.find(filter);
  const doctorData = await Doctor.find(filter);

  let mergerdData = [...teamData, ...doctorData];

  let totalActive = 0;
  const updatedData = await Promise.all(
    mergerdData.map(async (val) => {
      const subAdmin = await SubAdmin.findOne({ email: val?.email||val?.emailId });
      console.log(subAdmin);
      
      if (subAdmin?.isActive) {
        totalActive += 1;
      }
      return {
        ...val.toObject(),
        isActive: subAdmin?.isActive ? "Yes" : "No",
      };
    })
  );

  

  res.status(200).json({
    message: "Success",
    updatedData,
    totalActive,
  });
});

export const getBranchAnalytical = catchAsync(async (req, res, next) => {
  const { branchId, orgId, day } = req.query;

  if (!branchId || !orgId) {
    return next(new AppError("branchId or orgId missing in query!", 400));
  }
  let filter = {};
  if (branchId) {
    filter.branch = branchId;
  }
  if (orgId) {
    filter.organizationId = orgId;
  }

  if (day) {
    const now = new Date();

    switch (day) {
      case "today":
        filter.createdAt = { $gte: startOfDay(now), $lte: endOfDay(now) };
        break;

      case "thisWeek":
        filter.createdAt = { $gte: startOfWeek(now), $lte: endOfWeek(now) };
        break;

      case "thisMonth":
        filter.createdAt = { $gte: startOfMonth(now), $lte: endOfMonth(now) };
        break;
      
      case "thisYear":
        filter.createdAt = { $gte: startOfYear(now), $lte: endOfYear(now) };
        break;

      default:
        break;
    }
  }

  const twoDaysAgo = new Date();
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

  const [
    totalWalkinPatient,
    totalAppointmentPatient,
    totalArrivedPatient,
    totalCancelledPatient,
    totalReschedulePatient,
    newPatients,
  ] = await Promise.all([
    OutPatient.countDocuments(filter),
    Appointment.countDocuments(filter),
    Appointment.countDocuments({ ...filter, queueStatus: "waiting" }),
    Appointment.countDocuments({ ...filter, isCancelled: true }),
    Appointment.countDocuments({ ...filter, isRescheduled: true }),
    Patient.countDocuments({
      ...filter,
      createdAt: { $gte: twoDaysAgo, $lte: new Date() },
    }),
  ]);


  res.status(200).json({
    message: "Success",
    totalWalkinPatient,
    totalAppointmentPatient,
    totalArrivedPatient,
    totalCancelledPatient,
    totalReschedulePatient,
    newPatients,
  });
});

export const getStaffAnalytical = catchAsync(async (req, res, next) => {

  const { branchId, orgId, day } = req.query;

  if (!branchId || !orgId) {
    return next(new AppError("branchId or orgId missing in query!", 400));
  }
  let filter = {};
  if (branchId) {
    filter.branchId = branchId;
  }
  if (orgId) {
    filter.organizationId = orgId;
  }

  if (day) {
    const now = new Date();

    switch (day) {
      case "today":
        filter.createdAt = { $gte: startOfDay(now), $lte: endOfDay(now) };
        break;

      case "thisWeek":
        filter.createdAt = { $gte: startOfWeek(now), $lte: endOfWeek(now) };
        break;

      case "thisMonth":
        filter.createdAt = { $gte: startOfMonth(now), $lte: endOfMonth(now) };
        break;

      case "thisYear":
        filter.createdAt = { $gte: startOfYear(now), $lte: endOfYear(now) };
        break;

      default:
        break;
    }
  }

  const twoDaysAgo = new Date();
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

  const [totalConsultation, totalFollowUp, totalNurseTask] = await Promise.all([
    Patient.countDocuments(filter),
    Prescription.countDocuments({ ...filter }),
    NurseStation.countDocuments({ ...filter, status: "Completed" }),
  ]);

  res.status(200).json({
    message: "Success",
    totalConsultation,
    totalFollowUp,
    totalNurseTask,
  });
});

export const getBranchDmMenu = catchAsync(async (req, res, next) => {
  if (!req.query.orgId) {
    return next(new AppError("orgId missing in query!", 400));
  }
  let filter = {};

  if (req.query.orgId) {
    filter.organizationId = new mongoose.Types.ObjectId(req.query.orgId);
  }

  const branchNameDM = await Branch.aggregate([
    { $match: { ...filter, isActive: true } },
    {
      $project: {
        _id: 0,
        label: "$branchName",
        value: "$_id",
      },
    },
  ]);

  res.status(200).json({
    message: "Success",
    branchNameDM,
  });
});



export const getBranchDoctorVisits = catchAsync(async (req, res, next) => {
  if (!req.query.orgId) {
    return next(new AppError("OrgId required!", 400));
  }

  let filter = { organizationId: req.query.orgId };


  const visits = await OutPatient.aggregate([
    { $match: filter },
    {
      $group: {
        _id: {
          branch: "$branch",       
          doctor: "$doctorName",    
        },
        totalCount: { $sum: 1 },
      },
    },
    {
      $lookup: {
        from: "branch",
        localField: "_id.branch",
        foreignField: "_id",
        as: "branch",
      },
    },
    { $unwind: "$branch" },
    {
      $project: {
        _id: 0,
        branchName: "$branch.branchName",
        doctorName: "$_id.doctor",
        visitType: "$_id.visitType",
        totalCount: 1,
      },
    },
    { $sort: { totalCount: -1 } },
  ]);

 

  const ranked = visits.map((v, i) => ({
    ...v,
    rank: i + 1,
  }));

  res.status(200).json({
    message: "Success",
    data: ranked,
  });
});



export const higiActivity = catchAsync(async (req, res, next) => {
  const { orgId, branchId } = req.query;

  if (!orgId) {
    return next(new AppError("OrgId required!", 400));
  }
  if (!branchId) {
    return next(new AppError("BranchId required!", 400));
  }

  // Count for selected branch
  const [branchOutCount, branchAppCount] = await Promise.all([
    OutPatient.countDocuments({ organizationId: orgId, branch: branchId }),
    Appointment.countDocuments({ organizationId: orgId, branch: branchId }),
  ]);
  const branchTotal = branchOutCount + branchAppCount;

  // Count for other branches (exclude given branchId)
  const [otherOutCount, otherAppCount] = await Promise.all([
    OutPatient.countDocuments({ organizationId: orgId, branch: { $ne: branchId } }),
    Appointment.countDocuments({ organizationId: orgId, branch: { $ne: branchId } }),
  ]);
  const otherTotal = otherOutCount + otherAppCount;

  // Grand total
  const grandTotal = branchTotal + otherTotal;

  // Percentages
  const branchPct = grandTotal > 0 ? ((branchTotal / grandTotal) * 100).toFixed(2) : 0;
  const otherPct = grandTotal > 0 ? ((otherTotal / grandTotal) * 100).toFixed(2) : 0;

  res.status(200).json({
    message: "Success",
    branchId,
    branchActivity: {
      total: branchTotal,
      percentage: parseInt(branchPct),
    },
    otherBranchesActivity: {
      total: otherTotal,
      percentage: otherPct,
    },
    grandTotal,
  });
});

