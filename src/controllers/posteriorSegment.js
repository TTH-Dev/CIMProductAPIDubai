import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js";
import APIFeatures from "../utils/ApiFeatures.js";
import PosteriorSegment from "../models/posteriorSegment.js";



export const createPosteriorSegment = catchAsync(async (req, res, next) => {
    const { datas } = req.body;

    let data = {};
    data = JSON.parse(datas);

    if (req.files) {
        if (req.files.posteriorSegmentImage) {
            data.posteriorSegmentImage = req.files.posteriorSegmentImage[0].filename;
        }
    }

    const posteriorSegment = await PosteriorSegment.create(data);

    res.status(201).json({
        status: "Success",
        message: "Anterior Segment Entry Created",
        data: { posteriorSegment }
    });
});

export const getAllPosteriorSegments = catchAsync(async (req, res, next) => {

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

    const features = new APIFeatures(PosteriorSegment.find(filter), req.query)
        .limitFields()
        .sort()
        .paginate();

    const posteriorSegment = await features.query;
    const totalRecords = await PosteriorSegment.countDocuments(filter);
    const totalPages = Math.ceil(totalRecords / limit);

    res.status(200).json({
        status: "Success",
        totalPages,
        currentPage: page,
        result: posteriorSegment.length,
        data: { posteriorSegment },
    });
});


export const getPosteriorSegment = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const entry = await PosteriorSegment.findById(id);

    if (!entry) {
        return next(new AppError("No Anterior Segment entry found with that ID", 404));
    }

    res.status(200).json({
        status: "Success",
        data: { entry }
    });
});

export const updatePosteriorSegment = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const {datas} = req.body;
    let data = {};
    data = JSON.parse(datas);

    if (req.files) {
        if (req.files.posteriorSegmentImage) {
            data.posteriorSegmentImage = req.files.posteriorSegmentImage[0].filename;
        }
    }

    const updatedEntry = await PosteriorSegment.findByIdAndUpdate(id, data, {
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

export const deletePosteriorSegment = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const entry = await PosteriorSegment.findByIdAndDelete(id);

    if (!entry) {
        return next(new AppError("No Anterior Segment entry found with that ID", 404));
    }

    res.status(204).json({
        status: "Success",
        message: "Anterior Segment Entry Deleted Successfully"
    });
});
