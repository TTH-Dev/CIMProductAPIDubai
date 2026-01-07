import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js";
import APIFeatures from "../utils/ApiFeatures.js";
import Vitals from "../models/Vitals.js";

export const createVitals = catchAsync(async (req, res, next) => {
  const { patientId } = req.body;

  if (!patientId) {
    return next(new AppError("ID is MMissing", 404));
  }

  const vital = await Vitals.create(req.body);

  res.status(200).json({
    status: "Success",
    data: {
      vital,
    },
  });
});

export const getAllVitals = catchAsync(async (req, res, next) => {
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
    Vitals.find(filter).populate("doctorId"),
    req.query
  )
    .limitFields()
    .sort()
    .paginate();

  const chiefComplaints = await features.query;

  const totalRecords = await Vitals.countDocuments(filter);
  const totalPages = Math.ceil(totalRecords / limit);

  res.status(200).json({
    status: "Success",
    totalPages,
    currentPage: page,
    result: chiefComplaints.length,
    data: { data:chiefComplaints },
  });
});

export const getVitalsById = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const chiefComplaint = await Vitals.findById(id);

  if (!chiefComplaint) {
    return next(new AppError("Chief complaint not found", 404));
  }

  res.status(200).json({
    status: "Success",
    data: { chiefComplaint },
  });
});

export const updateVitals = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const updatedChiefComplaint = await Vitals.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!updatedChiefComplaint) {
    return next(new AppError("Chief complaint not found", 404));
  }

  res.status(200).json({
    status: "Success",
    data: { updatedChiefComplaint },
  });
});

export const deleteVitals = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const deletedChiefComplaint = await Vitals.findByIdAndDelete(id);

  if (!deletedChiefComplaint) {
    return next(new AppError("Chief complaint not found", 404));
  }

  res.status(204).json({
    status: "Success",
    data: null,
  });
});
