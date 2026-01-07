import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js";
import Treatment from "../models/treatment.js";
import mongoose from "mongoose"

export const createTreatment = catchAsync(async (req, res, next) => {
  const data = await Treatment.create(req.body);
  res.status(201).json({
    status: "success",
    message: "Treatment created successfully",
    data,
  });
});

export const getAllTreatment = catchAsync(async (req, res, next) => {
  const limit = req.query.limit || 10;
  const page = req.query.page || 1;
  const skip = (page - 1) * limit;

  if (!req.query.orgId) {
    return next(new AppError("OrgId is required!", 400));
  }

  const filter = {};

  if (req.query.treatmentName) {
    filter.treatmentName = req.query.treatmentName;
  }
  if (req.query.orgId) {
    filter.organizationId = req.query.orgId;
  }
    if (req.query.branch) {
    filter.branch = req.query.branch;
  }
  const data = await Treatment.find(filter)
    .limit(limit)
    .skip(skip)
    .sort({ createdAt: -1 });
  const totalDocuments = await Treatment.countDocuments();
  const totalPages = Math.ceil(totalDocuments / limit);
  res.status(200).json({
    message: "Success",
    data,
    totalPages,
    page,
  });
});

export const editTreatmentById = catchAsync(async (req, res, next) => {
  if (!req.query.id) {
    return next(new AppError("Id is missing", 400));
  }

  const value = await Treatment.findById(req.query.id);

  if (!value) {
    return next(new AppError("Treatment not found!", 401));
  }

  const data = await Treatment.findByIdAndUpdate(req.query.id, req.body, {
    runValidators: true,
    new: true,
  });

  res.status(200).json({
    message: "Success",
    data,
  });
});

export const deleteTreatmentById = catchAsync(async (req, res, next) => {
  if (!req.query.id) {
    return next(new AppError("Id is required!", 400));
  }
  const data = await Treatment.findByIdAndDelete(req.query.id);

  res.status(200).json({
    message: "Success",
    data,
  });
});

export const getTreatmentById = catchAsync(async (req, res, next) => {
  if (!req.query.id) {
    return next(new AppError("Id is required!", 400));
  }
  const data = await Treatment.findOne({ _id: req.query.id });

  if (!data) {
    return next(new AppError("No data found!", 401));
  }
  res.status(200).json({
    message: "Success",
    data,
  });
});

export const treatmentDmMenu = catchAsync(async (req, res, next) => {
  if (!req.query.orgId) {
    return next(new AppError("OrgId is required!", 400));
  }

  let filter={}

  if(req.query.orgId){
    filter.organizationId=new mongoose.Types.ObjectId(req.query.orgId)
  }

  
  if(req.query.branch){
    filter.branch=new mongoose.Types.ObjectId(req.query.branch)
  }

  const data = await Treatment.aggregate([
    {
      $match:filter,
    },
    {
      $project: {
        _id: 1,
        treatmentName: 1,
      },
    },
  ]);
  res.status(200).json({
    status: "success",
    data,
  });
});
