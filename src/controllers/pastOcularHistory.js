import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js";
import APIFeatures from "../utils/ApiFeatures.js";
import PastOcularHistory from "../models/pastOcularHistory.js";

export const createPastOcularHistory = catchAsync(async (req, res, next) => {
    const { patientId } = req.body;

    if (!patientId) {
        return next(new AppError("Patient ID is missing", 400));
    }
    const pastOcularHistory = await PastOcularHistory.create(req.body);

    res.status(201).json({
        status: "Success",
        data: { pastOcularHistory },
    });
});

export const getAllPastOcularHistories = catchAsync(async (req, res, next) => {
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;

    let query = {};
    if (req.query.createdAt) {
        const date = new Date(createdAt);
        const nextDay = new Date(date);
        nextDay.setDate(date.getDate() + 1);
        query.createdAt = { $gte: date, $lt: nextDay };
    }
    if (req.query.patientId) {
        query.patientId = req.query.patientId;
    }

    const features = new APIFeatures(PastOcularHistory.find(query), req.query)
        .limitFields()
        .sort()
        .paginate();

    const pastOcularHistories = await features.query;
    const totalRecords = await PastOcularHistory.countDocuments();
    const totalPages = Math.ceil(totalRecords / limit);

    res.status(200).json({
        status: "Success",
        totalPages,
        currentPage: page,
        result: pastOcularHistories.length,
        data: { pastOcularHistories },
    });
});

// Get a specific PastOcularHistory by ID
export const getPastOcularHistoryById = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const pastOcularHistory = await PastOcularHistory.findById(id);
    if (!pastOcularHistory) {
        return next(new AppError("Past Ocular History not found", 404));
    }

    res.status(200).json({
        status: "Success",
        data: { pastOcularHistory },
    });
});

// Update a PastOcularHistory record
export const updatePastOcularHistory = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const updatedPastOcularHistory = await PastOcularHistory.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true,
    });

    if (!updatedPastOcularHistory) {
        return next(new AppError("Past Ocular History not found", 404));
    }

    res.status(200).json({
        status: "Success",
        data: { updatedPastOcularHistory },
    });
});

// Delete a PastOcularHistory record
export const deletePastOcularHistory = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const deletedPastOcularHistory = await PastOcularHistory.findByIdAndDelete(id);
    if (!deletedPastOcularHistory) {
        return next(new AppError("Past Ocular History not found", 404));
    }

    res.status(204).json({
        status: "Success",
        data: null,
    });
});
