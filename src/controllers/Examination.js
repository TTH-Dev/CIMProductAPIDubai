import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js";
import APIFeatures from "../utils/ApiFeatures.js";
import Examination from "../models/Examination.js";

export const createExamination = catchAsync(async (req, res, next) => {
  const { patientId } = req.body;

  if (!patientId) {
    return next(new AppError("ID is MMissing", 404));
  }

  const exam = await Examination.create(req.body);

  res.status(200).json({
    status: "Success",
    data: {
      exam,
    },
  });
});

export const getAllexam = catchAsync(async (req, res, next) => {
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

  const features = new APIFeatures(
    Examination.find(filter).populate("doctorId"),
    req.query
  )
    .limitFields()
    .sort()
    .paginate();

  const exam = await features.query;

  const totalRecords = await Examination.countDocuments(filter);
  const totalPages = Math.ceil(totalRecords / limit);

  res.status(200).json({
    status: "Success",
    totalPages,
    currentPage: page,
    result: exam.length,
    data: { data:exam },
  });
});

export const getExamById = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const exam = await Examination.findById(id);

  if (!exam) {
    return next(new AppError("Chief complaint not found", 404));
  }

  res.status(200).json({
    status: "Success",
    data: { exam },
  });
});

export const updateExam = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const updatedexam = await Examination.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!updatedexam) {
    return next(new AppError("Chief complaint not found", 404));
  }

  res.status(200).json({
    status: "Success",
    data: { updatedexam },
  });
});

export const deleteExam = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const deletedExam = await Examination.findByIdAndDelete(id);

  if (!deletedExam) {
    return next(new AppError("Chief complaint not found", 404));
  }

  res.status(204).json({
    status: "Success",
    data: null,
  });
});
