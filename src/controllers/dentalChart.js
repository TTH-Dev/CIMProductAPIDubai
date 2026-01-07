import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js";
import APIFeatures from "../utils/ApiFeatures.js";
import DentalChart from "../models/dentalChart.js";

export const createDentalChart = catchAsync(async (req, res, next) => {
  const { patientId } = req.body;

  if (!patientId) {
    return next(new AppError("Patient ID is missing", 404));
  }


  const data = await DentalChart.create(req.body);

  res.status(200).json({
    status: "Success",
    data: { data },
  });
});

export const getAllDentalChart = catchAsync(async (req, res, next) => {

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

  const features = new APIFeatures(DentalChart.find(filter), req.query)
    .sort({createdAt:-1})

  const data = await features.query;

  res.status(200).json({
    status: "Success",
    data: { data },
  });
});

export const getDentalChartById = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const data = await DentalChart.findById(id);
  if (!data) {
    return next(new AppError("Dental History not found", 404));
  }

  res.status(200).json({
    status: "Success",
    data: { data },
  });
});

export const updateDentalChart = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const data = await DentalChart.findByIdAndUpdate(id, req.body, {
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

export const deleteDentalChart = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const data = await DentalChart.findByIdAndDelete(id);
  if (!data) {
    return next(new AppError("Dental History not found", 404));
  }

  res.status(204).json({
    status: "Success",
    data: null,
  });
});
