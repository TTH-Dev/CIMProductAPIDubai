import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js";
import rfqManagment from "../models/rfqManagment.js";

export const createPharmacyRequestQuote = catchAsync(async (req, res, next) => {
  if (!req.body.organizationId) {
    return next(new AppError("organizationId is required!", 400));
  }
  const product = await rfqManagment.create(req.body);

  res.status(201).json({
    status: "success",
    message: "Quote created successfully",
    data: product,
  });
});

export const gelALlPharmacyRequestQuote = catchAsync(async (req, res, next) => {
  if (!req.query.organizationId) {
    return next(new AppError("organizationId is required!", 400));
  }

  let filter = {};

  if (req.query.organizationId) {
    filter.organizationId = req.query.organizationId;
  }

  if (req.query.branch) {
    filter.branch = req.query.branch;
  }

  const limit = req.query.limit || 10;
  const page = req.query.page || 1;
  const skip = (page = 1) * limit;

  const product = await rfqManagment
    .find(filter)
    .limit(limit)
    .skip(skip)
    .sort({ createdAt: -1 });

  const totalDocuments = await rfqManagment.countDocuments(filter);
  const totalPages = Math.ceil(totalDocuments / limit);
  res.status(201).json({
    status: "success",
    data: product,
    totalPages,
  });
});
