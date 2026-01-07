import catchAsync from "../utils/catchAsync.js";
import AppError from '../utils/AppError.js';
import APIFeatures from "../utils/ApiFeatures.js";
import Allergies from "../models/allergies.js";


export const createAllergies = catchAsync(async (req, res, next) => {
    const { patientId } = req.body;

    if (!patientId) {
        return next(new AppError("ID is MMissing", 404));
    }

    const allergies = await Allergies.create(req.body);

    res.status(200).json({
        status: "Success",
        data: {
            allergies
        },
    });
});


export const getAllAllergies = catchAsync(async (req, res, next) => {
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    let filter = {};

    if (req.query.patientId) {
        filter.patientId = req.query.patientId;
    }

    if (req.query.date) {
        const date = new Date(req.query.date);
        filter.enteredDate = {
            $gte: new Date(date.setHours(0, 0, 0, 0)),
            $lt: new Date(date.setHours(23, 59, 59, 999)),
        };
    }

    const features = new APIFeatures(Allergies.find(filter).populate("doctorId"), req.query)
        .limitFields()
        .sort()
        .paginate();

    const allergies = await features.query;

    const totalRecords = await Allergies.countDocuments(filter);
    const totalPages = Math.ceil(totalRecords / limit);

    res.status(200).json({
        status: "Success",
        totalPages,
        currentPage: page,
        result: allergies.length,
        data: { allergies },
    });
});


export const getAllergiesById = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const allergies = await Allergies.findById(id);

    if (!allergies) {
        return next(new AppError("Chief complaint not found", 404));
    }

    res.status(200).json({
        status: "Success",
        data: { allergies },
    });
});

export const updateAllergies = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const updatedAllergies = await Allergies.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true
    });

    if (!updatedAllergies) {
        return next(new AppError("Chief complaint not found", 404));
    }

    res.status(200).json({
        status: "Success",
        data: { updatedAllergies }
    });
});

export const deleteAllergies = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const deletedAllergies = await Allergies.findByIdAndDelete(id);

    if (!deletedAllergies) {
        return next(new AppError("Chief complaint not found", 404));
    }

    res.status(204).json({
        status: "Success",
        data: null
    });
});
