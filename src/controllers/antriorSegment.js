import AnteriorSegment from "../models/antriorSegment.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js";
import APIFeatures from "../utils/ApiFeatures.js";


export const createAnteriorSegment = catchAsync(async (req, res, next) => {
    const newEntry = await AnteriorSegment.create(req.body);

    res.status(201).json({
        status: "Success",
        message: "Anterior Segment Entry Created",
        data: { newEntry }
    });
});

export const getAllAnteriorSegments = catchAsync(async (req, res, next) => {
    
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

    const features = new APIFeatures(AnteriorSegment.find(filter), req.query)
        .limitFields()
        .sort()
        .populateAll(AnteriorSegment.schema)
        .paginate();

    const antriorSegment = await features.query;
    const totalRecords = await AnteriorSegment.countDocuments(filter);
    const totalPages = Math.ceil(totalRecords / limit);

    res.status(200).json({
        status: "Success",
        totalPages,
        currentPage: page,
        result: antriorSegment.length,
        data: { antriorSegment },
    });
});


export const getAnteriorSegment = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const entry = await AnteriorSegment.findById(id);

    if (!entry) {
        return next(new AppError("No Anterior Segment entry found with that ID", 404));
    }

    res.status(200).json({
        status: "Success",
        data: { entry }
    });
});

export const updateAnteriorSegment = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const updatedEntry = await AnteriorSegment.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true
    });

    if (!updatedEntry) {
        return next(new AppError("No Anterior Segment entry found with that ID", 404));
    }

    res.status(200).json({
        status: "Success",
        message: "Anterior Segment Entry Updated",
        data: { updatedEntry }
    });
});

export const deleteAnteriorSegment = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const entry = await AnteriorSegment.findByIdAndDelete(id);

    if (!entry) {
        return next(new AppError("No Anterior Segment entry found with that ID", 404));
    }

    res.status(204).json({
        status: "Success",
        message: "Anterior Segment Entry Deleted Successfully"
    });
});
