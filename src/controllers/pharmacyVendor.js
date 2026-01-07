import PharmacyVendor from "../models/pharmacyVendor.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js";
import APIFeatures from "../utils/ApiFeatures.js";

export const createPharmacyVendor = catchAsync(async (req, res, next) => {
  const vendor = await PharmacyVendor.create(req.body);

  res.status(201).json({
    status: "success",
    message: "Vendor created successfully",
    data: vendor,
  });
});

export const getAllPharmacyVendors = catchAsync(async (req, res, next) => {
  if (!req.query.organizationId) {
    return next(new AppError("organizationId is required!", 400));
  }

  const limit = parseInt(req.query.limit) || 10;
  const page = parseInt(req.query.page) || 1;
  const skip = (page-1)*limit
  let filter = {};

  if (req.query.organizationId) {
    filter.organizationId = req.query.organizationId;
  }

  if (req.query.branch) {
    filter.branch = req.query.branch;
  }

  if(req.query.vendorName){
    filter.vendorName=req.query.vendorName
  }

  if(req.query.city){
    filter.city=req.query.city
  }

    if(req.query.vendorId){
      filter.PhpVendorNo=req.query.vendorId
  }


  const vendors = await PharmacyVendor.find(filter).skip(skip).limit(limit).sort({createdAt:-1})

  const totalVendors = await PharmacyVendor.countDocuments(filter);

  const totalPages = Math.ceil(totalVendors / limit);

  res.status(200).json({
    status: "success",
    total: totalVendors,
    results: vendors.length,
    totalPages,
    page,
    data: { vendors },
  });
});

export const getPharmacyVendor = catchAsync(async (req, res, next) => {
  const vendor = await PharmacyVendor.findById(req.params.id);

  if (!vendor) {
    return next(new AppError("No vendor found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: { vendor },
  });
});

export const updatePharmacyVendor = catchAsync(async (req, res, next) => {
  const vendor = await PharmacyVendor.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  if (!vendor) {
    return next(new AppError("No vendor found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    message: "Vendor updated successfully",
    data: { vendor },
  });
});

export const deletePharmacyVendor = catchAsync(async (req, res, next) => {
  const vendor = await PharmacyVendor.findByIdAndDelete(req.params.id);

  if (!vendor) {
    return next(new AppError("No vendor found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    message: "Vendor deleted successfully",
  });
});

export const filterPharmacyVendors = catchAsync(async (req, res, next) => {
  const limit = parseInt(req.query.limit) || 10;
  const page = parseInt(req.query.page) || 1;

  let filter = {};

  if (req.query.organizationId) {
    filter.organizationId = req.query.organizationId;
  }

  if (req.query.branch) {
    filter.branch = req.query.branch;
  } else {
    return next(new AppError("Organization Id required!", 400));
  }

  if (req.query.vendorName) {
    filter.vendorName = { $regex: req.query.vendorName, $options: "i" };
  }
  if (req.query.vendorId) {
    if (mongoose.Types.ObjectId.isValid(req.query.productId)) {
      filter._id = { $regex: req.query.vendorId, $options: "i" };
    }
  }
  if (req.query.location) {
    filter.location = { $regex: req.query.location, $options: "i" };
  }

  const features = new APIFeatures(PharmacyVendor.find(filter), req.query)
    .sort()
    .limitFields()
    .paginate();

  const vendors = await features.query;
  const totalRecords = await PharmacyVendor.countDocuments(filter);
  const totalPages = Math.ceil(totalRecords / limit);

  res.status(200).json({
    status: "success",
    totalPages,
    currentPage: page,
    results: vendors.length,
    data: { vendors },
  });
});

export const getPharmacyVendorDM = catchAsync(async (req, res, next) => {
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

  const vendorNames = await PharmacyVendor.find(filter).select(
    "vendorName _id"
  );

  if (!vendorNames || vendorNames.length === 0) {
    return next(new AppError("No vendor found for this organization", 404));
  }

  const data = vendorNames.map((vendor) => ({
    label: vendor.vendorName,
    value: vendor._id,
  }));

  res.status(200).json({
    status: "success",
    data,
  });
});

export const getPaymentDetails = catchAsync(async (req, res) => {
  const data = {
    totalBillamount: 0,
    cashAmount: 0,
    cardAmount: 0,
    upiAmount: 0,
    discountAmount: 0,
    indentAmount: 0,
    indentReturn: 0,
  };
});


export const getPharmacyVendorDropDM = catchAsync(async (req, res, next) => {
  const fields = req.query.fields?.split(",") || [];

  if (fields.length === 0) {
    return next(new AppError("fields is required", 400));
  }

  let filter = {
    organizationId: req.query.organizationId,
  };
  if (req.query.branch) filter.branch = req.query.branch;

  let response = {};

  for (let field of fields) {
    const distinctValues = await PharmacyVendor.distinct(field, filter);
    response[field] = distinctValues.map(v => ({ label: v, value: v }));
  }

  res.status(200).json({
    status: "success",
    response,
  });
});
