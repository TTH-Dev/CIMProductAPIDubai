import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js";
import APIFeatures from "../utils/ApiFeatures.js";
import DentalHistory from "../models/dentalHistory.js";

export const createDentalHistory = catchAsync(async (req, res, next) => {
  const { patientId } = req.body;

  if (!patientId) {
    return next(new AppError("Patient ID is missing", 404));
  }

  const data = await DentalHistory.create(req.body);

  res.status(200).json({
    status: "Success",
    data: { data },
  });
});

export const getAllDentalHistory = catchAsync(async (req, res, next) => {
  const limit = parseInt(req.query.limit) || 10;
  const page = parseInt(req.query.page) || 1;
  let filter = {};

  if (req.query.patientId) {
    filter.patientId = req.query.patientId;
  }

  if (req.query.date) {
    const date = new Date(req.query.date);
    filter.enteredDate = {
      $gte: new Date(date.setHours(0, 0, 0, 0)),
      $lt: new Date(date.setHours(23, 59, 59, 999)),
    };
  }

  const features = new APIFeatures(DentalHistory.find(filter), req.query)
    .limitFields()
    .sort()
    .paginate();

  const data = await features.query;
  const totalRecords = await DentalHistory.countDocuments(filter);
  const totalPages = Math.ceil(totalRecords / limit);

  res.status(200).json({
    status: "Success",
    totalPages,
    currentPage: page,
    result: data.length,
    data: { data },
  });
});

export const getDentalHistoryById = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const data = await DentalHistory.findById(id);
  if (!data) {
    return next(new AppError("Dental History not found", 404));
  }

  res.status(200).json({
    status: "Success",
    data: { data },
  });
});

export const updateDentalHistory = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const data = await DentalHistory.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!data) {
    return next(new AppError("Dental History not found", 404));
  }

  res.status(200).json({
    status: "Success",
    data: { data },
  });
});

export const deleteDentalHistory = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const data = await DentalHistory.findByIdAndDelete(id);
  if (!data) {
    return next(new AppError("Dental History not found", 404));
  }

  res.status(204).json({
    status: "Success",
    data: null,
  });
});
