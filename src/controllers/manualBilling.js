import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js";
import APIFeatures from "../utils/ApiFeatures.js";
import ManualBilling from "../models/manualBilling.js";
import PharmacyProduct from "../models/PharmacyProduct.js";

export const createBilling = catchAsync(async (req, res, next) => {
  const { patientId, billDetails,organizationId } = req.body;

  if (!patientId) {
    return next(new AppError("PatientId is required", 400));
  }
  if(!organizationId){
    return next(new AppError("organizationId is required",400))
  }

  const manualBilling = await ManualBilling.create(req.body);

  for (const item of billDetails) {
    const product = await PharmacyProduct.findById(item.productId);
    if (!product) {
      return next(new AppError(`Product not found: ${item.productId}`, 404));
    }

    if (product.stock < item.quantity) {
      return next(
        new AppError(
          `Insufficient stock for product ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`,
          400
        )
      );
    }

    product.stock -= item.quantity;
    await product.save();
  }

  res.status(201).json({
    status: "Success",
    message: "Billing created and stock updated successfully",
    data: { manualBilling },
  });
});


export const getManualBillById=catchAsync(async(req,res)=>{
    
    const {id}=req.params

    const bill=await ManualBilling.findById(id).populate("productId").populate("patientId")

    res.status(200).json({
        message:"Success",
        bill
    })
})



export const getAllBillings = catchAsync(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;

   const { date } = req.query;

  let filter = {};

  if(req.query.organizationId){
    filter.organizationId=req.query.organizationId
  }
  else{
    return next(new AppError(`organizationId not found: ${item.productId}`, 404));

  }

  



  if(req.query.branch){
    filter.branch=req.query.branchId
  }

  if (date) {
    const start = new Date(date);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999); 

    filter.createdAt = { $gte: start, $lte: end };
  }

  const features = new APIFeatures(ManualBilling.find(filter), req.query)
    .filter()
    .sort()
    .limitFields();

  const totalCount = await features.query.clone().countDocuments(filter);

  const data = await features
    .paginate() 
    .query
    .populate({
    path: "patientId",
    populate: {
      path: "doctorId",
      model: "Doctor",
    },
  })
  .populate("billedById")
  .populate({
    path: "billDetails.productId",
    model: "PharmacyProduct",
  })
    .sort({ createdAt: -1 });

  const totalPages = Math.ceil(totalCount / limit);

  res.status(200).json({
    message: "Success",
    results: data.length,
    total: totalCount,
    totalPages,
    currentPage: page,
    data,
  });
});



