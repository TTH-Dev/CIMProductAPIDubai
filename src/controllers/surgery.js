import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js";
import APIFeatures from "../utils/ApiFeatures.js";
import Surgery from "../models/surgery.js";


export const createSurgery = catchAsync(async (req, res, next) => {

    const surgery = await Surgery.create(req.body);

    res.status(201).json({
        status: "success",
        message: "Surgery created successfully",
        data: { surgery },
    });
});

export const getAllSurgeries = catchAsync(async (req, res, next) => {
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const { patientType } = req.query;

    let filter = {};
    if (patientType) {
        filter.patientType = patientType;
    }

    const features = new APIFeatures(Surgery.find(filter), req.query)
        .sort()
        .limitFields()
        .paginate();

    const surgeries = await features.query;
    const totalRecords = await Surgery.countDocuments(filter);
    const totalPages = Math.ceil(totalRecords / limit);

    res.status(200).json({
        status: "success",
        totalPages,
        currentPage: page,
        results: surgeries.length,
        data: { surgeries },
    });
});

export const getSurgeryById = catchAsync(async (req, res, next) => {
    const surgery = await Surgery.findById(req.params.id);

    if (!surgery) {
        return next(new AppError("No surgery found with that ID", 404));
    }

    res.status(200).json({
        status: "success",
        data: { surgery },
    });
});

export const updateSurgery = catchAsync(async (req, res, next) => {
    const surgery = await Surgery.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    });

    if (!surgery) {
        return next(new AppError("No surgery found with that ID", 404));
    }

    res.status(200).json({
        status: "success",
        message: "Surgery updated successfully",
        data: { surgery },
    });
});


export const deleteSurgery = catchAsync(async (req, res, next) => {
    const surgery = await Surgery.findByIdAndDelete(req.params.id);

    if (!surgery) {
        return next(new AppError("No surgery found with that ID", 404));
    }

    res.status(204).json({
        status: "success",
        message: "Surgery deleted successfully",
    });
});
