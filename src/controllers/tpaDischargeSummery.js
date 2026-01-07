import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js";
import APIFeatures from "../utils/ApiFeatures.js";
import TPADischargeSummery from "../models/tpaDischareForm.js";

export const createTPADischargeSummery = catchAsync(async (req, res, next) => {
    const dischargeSummery = await TPADischargeSummery.create(req.body);

    res.status(201).json({
        status: "Success",
        data: { dischargeSummery },
    });
});

export const getAllDischargeSummaries = catchAsync(async (req, res, next) => {
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;

    const filter = {};

    const features = new APIFeatures(TPADischargeSummery.find(filter), req.query)
        .limitFields()
        .sort()
        .paginate();

    const dischargeSummaries = await features.query;
    const totalRecords = await TPADischargeSummery.countDocuments(filter);
    const totalPages = Math.ceil(totalRecords / limit);

    res.status(200).json({
        status: "Success",
        totalPages,
        currentPage: page,
        result: dischargeSummaries.length,
        data: { dischargeSummaries },
    });
});

export const getTPADischargeSummeryById = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const dischargeSummery = await TPADischargeSummery.findById(id);
    if (!dischargeSummery) {
        return next(new AppError("Discharge Summary not found", 404));
    }

    res.status(200).json({
        status: "Success",
        data: { dischargeSummery },
    });
});

export const updateTPADischargeSummery = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const updatedSummery = await TPADischargeSummery.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true,
    });

    if (!updatedSummery) {
        return next(new AppError("Discharge Summary not found", 404));
    }

    res.status(200).json({
        status: "Success",
        data: { updatedSummery },
    });
});

export const deleteTPADischargeSummery = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const deletedSummery = await TPADischargeSummery.findByIdAndDelete(id);
    if (!deletedSummery) {
        return next(new AppError("Discharge Summary not found", 404));
    }

    res.status(204).json({
        status: "Success",
        data: null,
    });
});
