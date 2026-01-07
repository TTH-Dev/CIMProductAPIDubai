import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js";
import APIFeatures from "../utils/ApiFeatures.js";
import POM from "../models/planOfManageMent.js";

export const createPOM = catchAsync(async (req, res, next) => {

    const planOfManageMent = await POM.create(req.body);
    
    res.status(201).json({
        status: "success",
        message: "POM created successfully",
        data: { planOfManageMent },
    });
});

export const getAllPOMs = catchAsync(async (req, res, next) => {
    const { createdAt } = req.query;

    let query = {};

    if (createdAt) {
        const date = new Date(createdAt);
        const nextDay = new Date(date);
        nextDay.setDate(date.getDate() + 1);

        query.createdAt = { $gte: date, $lt: nextDay };
    }
    if (req.query.patientId) {
        query.patientId = req.query.patientId;
    }
    const features = new APIFeatures(POM.find(query), req.query)
        .sort()
        .limitFields()
        .paginate();

    const planOfManageMents = await features.query;

    res.status(200).json({
        status: "success",
        results: planOfManageMents.length,
        data: { planOfManageMents },
    });
});

export const getPOM = catchAsync(async (req, res, next) => {
  

    const planOfManageMent = await POM.find();

    if (!planOfManageMent || planOfManageMent.length === 0) {
        return next(new AppError("No planOfManageMent records found for the given date", 404));
    }

    res.status(200).json({
        status: "success",
        results: planOfManageMent.length,
        data: { planOfManageMent },
    });
});


export const updatePOM = catchAsync(async (req, res, next) => {
    const planOfManageMent = await POM.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    });

    if (!planOfManageMent) {
        return next(new AppError("No planOfManageMent found with that ID", 404));
    }

    res.status(200).json({
        status: "success",
        message: "POM updated successfully",
        data: { planOfManageMent },
    });
});

export const deletePOM = catchAsync(async (req, res, next) => {
    const planOfManageMent = await POM.findByIdAndDelete(req.params.id);
    if (!planOfManageMent) {
        return next(new AppError("No planOfManageMent found with that ID", 404));
    }

    res.status(204).json({
        status: "success",
        message: "POM deleted successfully",
    });
});


