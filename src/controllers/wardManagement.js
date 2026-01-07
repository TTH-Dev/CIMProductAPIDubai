import WardManagement from "../models/wardManagement.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js";
import APIFeatures from "../utils/ApiFeatures.js";

export const createWardManagement = catchAsync(async (req, res, next) => {
  const wardManagement = await WardManagement.create(req.body);

  res.status(201).json({
    status: "Success",
    data: { wardManagement },
  });
});

export const getAllWardManagements = catchAsync(async (req, res, next) => {
  const limit = parseInt(req.query.limit) || 10;
  const page = parseInt(req.query.page) || 1;
  let filter = {};

  if (req.query.patientId) filter.patientId = req.query.patientId;
  if (req.query.wardId) filter.wardId = req.query.wardId;
  if (req.query.roomId) filter.roomId = req.query.roomId;

  if (req.query.createdAt) {
    const date = new Date(req.query.createdAt);
    const nextDay = new Date(date);
    nextDay.setDate(date.getDate() + 1);
    filter.createdAt = { $gte: date, $lt: nextDay };
  }

  const features = new APIFeatures(WardManagement.find(filter), req.query)
    .limitFields()
    .sort()
    .paginate();

  const results = await features.query;
  const totalRecords = await WardManagement.countDocuments(filter);
  const totalPages = Math.ceil(totalRecords / limit);

  res.status(200).json({
    status: "Success",
    totalPages,
    currentPage: page,
    result: results.length,
    data: { wardManagements: results },
  });
});

export const getWardManagementById = catchAsync(async (req, res, next) => {
  const record = await WardManagement.findById(req.params.id)
    .populate("patientId doctorActivity.doctorId wardId");

  if (!record) return next(new AppError("Record not found", 404));

  res.status(200).json({
    status: "Success",
    data: { wardManagement: record },
  });
});

export const updateWardManagement = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const updateData = {};

  // Dynamic nested updates
  if (req.body.nurseActivity?.vitalChart) {
    updateData["nurseActivity.vitalChart"] = req.body.nurseActivity.vitalChart;
  }

  if (req.body.nurseActivity?.diet) {
    updateData["nurseActivity.diet"] = req.body.nurseActivity.diet;
  }
  if (req.body.nurseActivity?.diet) {
    updateData["nurseActivity.diet"] = req.body.nurseActivity.diet;
  }
  if (req.body.nurseActivity?.diet) {
    updateData["nurseActivity.patch"] = req.body.nurseActivity.diet;
  }
  if (req.body.nurseActivity?.diet) {
    updateData["nurseActivity.postCare"] = req.body.nurseActivity.diet;
  }

  if (req.body.doctorActivity) {
    updateData["doctorActivity"] = req.body.doctorActivity;
  }

  if (req.body.medicineActivity) {
    updateData["medicineActivity"] = req.body.medicineActivity;
  }

  if (req.body.dischargeNote) {
    updateData["dischargeNote"] = req.body.dischargeNote;
  }

  if (req.body.otActivity) {
    updateData["otActivity"] = req.body.otActivity;
  }

  if (Object.keys(updateData).length === 0) {
    return next(new AppError("No valid fields to update", 400));
  }

  const updated = await WardManagement.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true
  });

  if (!updated) {
    return next(new AppError("Ward Management record not found", 404));
  }

  res.status(200).json({
    status: "Success",
    data: { wardManagement: updated }
  });
});


export const deleteWardManagement = catchAsync(async (req, res, next) => {
  const deleted = await WardManagement.findByIdAndDelete(req.params.id);

  if (!deleted) return next(new AppError("Record not found", 404));

  res.status(204).json({
    status: "Success",
    data: null,
  });
});
