import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js";
import APIFeatures from "../utils/ApiFeatures.js";
import DentalAdvice from "../models/Advice.js";

export const createDentalAdvice = catchAsync(async (req, res, next) => {

  const data = await DentalAdvice.create(req.body);

  res.status(200).json({
    status: "Success",
    data,
  });
});

export const getAllDentalAdvice = catchAsync(async (req, res, next) => {
  const limit = parseInt(req.query.limit) || 10;
  const page = parseInt(req.query.page) || 1;
  let filter = {};

  if (req.query.patientId) {
    filter.patientId = req.query.patientId;
  }

  if (req.query.date) {
    const date = new Date(req.query.date);
    filter.createdAt = {
      $gte: new Date(date.setHours(0, 0, 0, 0)),
      $lt: new Date(date.setHours(23, 59, 59, 999)),
    };
  }

  const features = new APIFeatures(
    DentalAdvice.find(filter).populate("doctorId"),
    req.query
  )
    .limitFields()
    .sort()
    .paginate();

  const data = await features.query;

  const totalRecords = await DentalAdvice.countDocuments(filter);
  const totalPages = Math.ceil(totalRecords / limit);

  res.status(200).json({
    status: "Success",
    totalPages,
    currentPage: page,
    result: data.length,
    data: { data },
  });
});

export const getDentalAdviceById = catchAsync(async (req, res, next) => {
  const id = req.query.id;

  const data = await DentalAdvice.findById(id);

  if (!data) {
    return next(new AppError("Advice not found", 404));
  }

  res.status(200).json({
    status: "Success",
    data: { data },
  });
});

export const updateDentalAdvice = catchAsync(async (req, res, next) => {
  const id = req.query.id;

  const updatedDentalAdvice = await DentalAdvice.findByIdAndUpdate(
    id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!updatedDentalAdvice) {
    return next(new AppError("Advice not found", 404));
  }

  res.status(200).json({
    status: "Success",
    data: { updatedDentalAdvice },
  });
});
