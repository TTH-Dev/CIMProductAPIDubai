import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js";
import pharmacyProductRequest from "../models/pharmacyProductRequest.js";

export const createPharmacyRequest = catchAsync(async (req, res, next) => {
  if (!req.body.organizationId) {
    return next(new AppError("organizationId is required!", 400));
  }
  const product = await pharmacyProductRequest.create(req.body);

  res.status(201).json({
    status: "success",
    message: "Product created successfully",
    data: product,
  });
});

export const getAllPharmacyRequest = catchAsync(async (req, res, next) => {
  if (!req.query.organizationId) {
    return next(new AppError("organizationId is required!", 400));
  }

  let filter = {
    organizationId: req.query.organizationId,
  };

  if (req.query.branch) {
    filter.branch = req.query.branch;
  }

  if (req.query.reqID) {
    filter.reqID = req.query.reqID;
  }
  if (req.query.status) {
    filter.status = req.query.status;
  }

  const limit = req.query.limit || 10;
  const page = req.query.page || 1;
  const skip = (page - 1) * limit;

  const product = await pharmacyProductRequest
    .find(filter)
    .limit(limit)
    .skip(skip)
    .sort({ createdAt: -1 });

  const totalDocuments = await pharmacyProductRequest.countDocuments(filter);
  const totalPages = Math.ceil(totalDocuments / limit);

  res.status(201).json({
    status: "success",
    data: product,
    totalPages,
  });
});

export const getPharmacyRequestByID = catchAsync(async (req, res, next) => {
  const { id } = req.query;

  if (!id) {
    return next(new AppError("Id is missing in query!", 404));
  }

  const product = await pharmacyProductRequest
    .findOne({ _id: id })
    .populate("products.productId");
  if (!product) {
    return next(new AppError("No purchase found!", 404));
  }

  res.status(201).json({
    status: "success",
    data: product,
  });
});

export const getPharmaProdReqDM = catchAsync(async (req, res, next) => {
  if (!req.query.organizationId) {
    return next(new AppError("organizationId is required!", 400));
  }

  let filter = {
    organizationId: req.query.organizationId,
  };

  if (req.body.branch) {
    filter.branch = req.query.branch;
  }

  const fields = req.query.fields?.split(",") || [];

  let data = {};

  for (const field of fields) {
    const values = await pharmacyProductRequest.distinct(field, filter);
    data[field] = values.map((val) => ({ label: val, value: val }));
  }

  res.status(200).json({
    message: "Success",
    data,
  });
});

export const updatePharmaProdReq = catchAsync(async (req, res, next) => {
  const { id, productsID } = req.query;

  if (!id || !productsID) {
    return next(new AppError("Ids are missing in query!", 404));
  }

  const product = await pharmacyProductRequest.findOne({ _id: id });

  if (!product) {
    return next(new AppError("No product found!", 404));
  }

  const list = product.products.find(
    (val) => String(val._id) === productsID
  );

  if (!list) {
    return next(new AppError("Product item not found in list!", 404));
  }

  if(req.body.notes){
  list.notes = req.body.notes
  }

  if(req.body.requistionStatus){
    list.requistionStatus=req.body.requistionStatus
  }

  await product.save();

  res.status(200).json({
    message: "Success",
    product,
  });
});



export const updatePharmaProdReqStatus=catchAsync(async(req,res,next)=>{
  const {id}=req.query

  if(!id){
    return next(new AppError("Id is missing!",404))
  }

  const data=await pharmacyProductRequest.findByIdAndUpdate(id,req.body,{
    new:true,
    runValidators:true
  })

  res.status(200).json({
    message:"Success",
    data
  })


})
