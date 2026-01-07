import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js";
import TreatmentPlan from "../models/treatmentPlan.js";
import Prescription from "../models/Prescription.js"

export const createTreatmentPlan = catchAsync(async (req, res, next) => {
  const data = await TreatmentPlan.create(req.body);
  res.status(201).json({
    status: "success",
    message: "TreatmentPlan created successfully",
    data,
  });
});

export const getAllTreatmentPlan = catchAsync(async (req, res, next) => {
  if (!req.query.id) {
    return next(new AppError("PatientId required", 400));
  }
  let limit = parseInt(req.query.limit) || 10;
  let page = parseInt(req.query.page) || 1;
  let skip = (page - 1) * limit;
  let filter = {};
  if (req.query.id) {
    filter.patientId = req.query.id;
  }

  if (req.query.date) {
    const date = new Date(req.query.date);
    filter.enteredDate = {
      $gte: new Date(date.setHours(0, 0, 0, 0)),
      $lt: new Date(date.setHours(23, 59, 59, 999)),
    };
  }

  const data = await TreatmentPlan.find(filter)
    .limit(limit)
    .skip(skip)
    .sort({ createdAt: -1 })
    .populate("treatment");

  const totalDocuments = await TreatmentPlan.countDocuments(filter);

  const totalPages = Math.ceil(totalDocuments / limit);

  res.status(200).json({
    message: "success",
    totalPages,
    totalDocuments,
    data,
  });
});

export const editTreatmentPlanById = catchAsync(async (req, res, next) => {
  if (!req.query.id) {
    return next(new AppError("Id required!", 400));
  }
  const data = await TreatmentPlan.findByIdAndUpdate(req.query.id, req.body, {
    runValidators: true,
    new: true,
  });

  res.status(200).json({
    message: "Success",
    data,
  });
});

export const getTreatmentPlanById = catchAsync(async (req, res, next) => {
  if (!req.query.id) {
    return next(new AppError("Id required!", 401));
  }
  const data = await TreatmentPlan.findOne(req.query.id);

  res.status(200).json({
    message: "Success",
    data,
  });
});



