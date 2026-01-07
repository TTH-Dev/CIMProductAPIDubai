import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js";
import APIFeatures from "../utils/ApiFeatures.js";
import ConsultingFees from "../models/consultyFeed.js";

export const createConsultingFee = catchAsync(async (req, res, next) => {
    const consultingFee = await ConsultingFees.create(req.body);

    res.status(201).json({
        status: "success",
        message: "Consulting fee created successfully",
        data: { consultingFee },
    });
});

export const getAllConsultingFees = catchAsync(async (req, res, next) => {
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;

  

     if (!req.query.organizationId) {
    return next(new AppError('organizationId is required in query', 400));
  }

  let filter = {}


  if(req.query.organizationId){
    filter.organizationId=req.query.organizationId
  }
  if(req.query.branch){
    filter.branch=req.query.branch
  }

    const features = new APIFeatures(ConsultingFees.find(filter), req.query)
        .limitFields()
        .sort()
        .paginate();

    const consultingFees = await features.query;
    const totalRecords = await ConsultingFees.countDocuments(filter);
    const totalPages = Math.ceil(totalRecords / limit);

    res.status(200).json({
        status: "success",
        totalPages,
        currentPage: page,
        result: consultingFees.length,
        data: { consultingFees },
    });
});

// Get Consulting Fee by ID
export const getConsultingFeeById = catchAsync(async (req, res, next) => {
    const consultingFee = await ConsultingFees.findById(req.params.id);

    if (!consultingFee) {
        return next(new AppError("Consulting fee not found", 404));
    }

    res.status(200).json({
        status: "success",
        data: { consultingFee },
    });
});

// Update Consulting Fee
export const updateConsultingFee = catchAsync(async (req, res, next) => {
    const updatedConsultingFee = await ConsultingFees.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    });

    if (!updatedConsultingFee) {
        return next(new AppError("Consulting fee not found", 404));
    }

    res.status(200).json({
        status: "success",
        data: { updatedConsultingFee },
    });
});

// Delete Consulting Fee
export const deleteConsultingFee = catchAsync(async (req, res, next) => {
  const { parentId, feeId } = req.params;

  const updatedDoc = await ConsultingFees.findByIdAndUpdate(
    parentId,
    { $pull: { fees: { _id: feeId } } },
    { new: true }
  );

  if (!updatedDoc) {
    return next(new AppError("Consulting fee record not found", 404));
  }

  const deletedFee = updatedDoc.fees.find(fee => fee._id.toString() === feeId);
  if (deletedFee) {
    return next(new AppError("Failed to delete fee item", 500));
  }

  res.status(200).json({
    status: "success",
    message: "Fee item deleted successfully",
    data: updatedDoc
  });
});

