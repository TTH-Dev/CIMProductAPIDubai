import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js";
import APIFeatures from "../utils/ApiFeatures.js";
import Squint from "../models/squint.js";

export const createSquint = catchAsync(async (req, res, next) => {

    const data = {
        squintData: JSON.parse(req.body.squintData),
        squintWorkSheet: req.body.squintWorkSheet,
        patientId: req.body.patientId,
      };

    const squint = await Squint.create(data);

    res.status(201).json({
        status: "success",
        message: "Squint created successfully",
        data: { squint },
    });
});

export const getAllSquints = catchAsync(async (req, res, next) => {
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const { createdAt, patientId } = req.query;
    let query = {};
    if (createdAt) {
        const date = new Date(createdAt);
        const nextDay = new Date(date);
        nextDay.setDate(date.getDate() + 1);
        query.createdAt = { $gte: date, $lt: nextDay };
    }
    if (patientId) {
        query.patientId = req.query.patientId;
    }
    const features = new APIFeatures(Squint.find(query), req.query)
        .sort()
        .limitFields()
        .paginate();

    const squints = await features.query;
    const totalRecords = await Squint.countDocuments(query);
    const totalPages = Math.ceil(totalRecords / limit);

    res.status(200).json({
        status: "success",
        totalPages,
        currentPage: page,
        results: squints.length,
        data: { squints },
    });
});

export const getSquint = catchAsync(async (req, res, next) => {
    const squint = await Squint.findById(req.params.id);

    if (!squint) {
        return next(new AppError("No squint found with that ID", 404));
    }

    res.status(200).json({
        status: "success",
        data: { squint },
    });
});

export const updateSquint = catchAsync(async (req, res, next) => {
    const squint = await Squint.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    });

    if (!squint) {
        return next(new AppError("No squint found with that ID", 404));
    }

    res.status(200).json({
        status: "success",
        message: "Squint updated successfully",
        data: { squint },
    });
});

export const deleteSquint = catchAsync(async (req, res, next) => {
    const squint = await Squint.findByIdAndDelete(req.params.id);
    if (!squint) {
        return next(new AppError("No squint found with that ID", 404));
    }

    res.status(204).json({
        status: "success",
        message: "Squint deleted successfully",
    });
});