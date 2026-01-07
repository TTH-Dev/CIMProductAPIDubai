import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js";
import APIFeatures from "../utils/ApiFeatures.js";
import Lasik from "../models/lasik.js";

export const createLasik = catchAsync(async (req, res, next) => {
  if (req.files) {
    if (req.files?.signatureDocument) {
      req.body.signatureDocument = req.files?.signatureDocument[0].filename;
    }
  }

  const data = {
    lasikData: JSON.parse(req.body.lasikData),
    lasikWorkSheet: req.body.lasikWorkSheet,
    patientId: req.body.patientId,
  };

  const lasik = await Lasik.create(data);

  res.status(201).json({
    status: "success",
    message: "Lasik created successfully",
    data: { lasik },
  });
});

export const getAllLasiks = catchAsync(async (req, res, next) => {
  const limit = parseInt(req.query.limit) || 10;
  const page = parseInt(req.query.page) || 1;
  const { createdAt, patientId } = req.query;

  let query = {};

  if (createdAt) {
    const date = new Date(createdAt);
    const nextDay = new Date(date);
    nextDay.setDate(date.getDate() + 1);

    query.createdAt = { $gte: date, $lt: nextDay };
  }
  if (patientId) {
    query.patientId = req.query.patientId;
  }
  const features = new APIFeatures(Lasik.find(query), req.query)
    .sort()
    .limitFields()
    .paginate();

  const lasiks = await features.query;
  const totalRecords = await Lasik.countDocuments(query);
  const totalPages = Math.ceil(totalRecords / limit);

  res.status(200).json({
    status: "success",
    totalPages,
    currentPage: page,
    results: lasiks.length,
    data: { lasiks },
  });
});

export const getLasik = catchAsync(async (req, res, next) => {
  const lasik = await Lasik.find();

  if (!lasik || lasik.length === 0) {
    return next(new AppError("No lasik records found for the given date", 404));
  }

  res.status(200).json({
    status: "success",
    results: lasik.length,
    data: { lasik },
  });
});

export const updateLasik = catchAsync(async (req, res, next) => {
  const lasik = await Lasik.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!lasik) {
    return next(new AppError("No lasik found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    message: "Lasik updated successfully",
    data: { lasik },
  });
});

export const deleteLasik = catchAsync(async (req, res, next) => {
  const lasik = await Lasik.findByIdAndDelete(req.params.id);
  if (!lasik) {
    return next(new AppError("No lasik found with that ID", 404));
  }

  res.status(204).json({
    status: "success",
    message: "Lasik deleted successfully",
  });
});