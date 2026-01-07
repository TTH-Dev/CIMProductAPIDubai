import catchAsync from "../utils/catchAsync.js";
import AppError from '../utils/AppError.js';
import APIFeatures from "../utils/ApiFeatures.js";
import ChiefComplaints from "../models/cheifComplaints.js";


export const createChiefComplaints = catchAsync(async (req, res, next) => {
    const { patientId } = req.body;

    if (!patientId) {
        return next(new AppError("ID is MMissing", 404));
    }

    const cheifComplaints = await ChiefComplaints.create(req.body);

    res.status(200).json({
        status: "Success",
        data: {
            cheifComplaints
        },
    });
});


export const getAllChiefComplaints = catchAsync(async (req, res, next) => {
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

    const features = new APIFeatures(ChiefComplaints.find(filter).populate("doctorId"), req.query)
        .limitFields()
        .sort()
        .paginate();

    const chiefComplaints = await features.query;

    const totalRecords = await ChiefComplaints.countDocuments(filter);
    const totalPages = Math.ceil(totalRecords / limit);

    res.status(200).json({
        status: "Success",
        totalPages,
        currentPage: page,
        result: chiefComplaints.length,
        data: { chiefComplaints },
    });
});


export const getChiefComplaintById = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const chiefComplaint = await ChiefComplaints.findById(id);

    if (!chiefComplaint) {
        return next(new AppError("Chief complaint not found", 404));
    }

    res.status(200).json({
        status: "Success",
        data: { chiefComplaint },
    });
});

export const updateChiefComplaint = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const updatedChiefComplaint = await ChiefComplaints.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true
    });

    if (!updatedChiefComplaint) {
        return next(new AppError("Chief complaint not found", 404));
    }

    res.status(200).json({
        status: "Success",
        data: { updatedChiefComplaint }
    });
});

export const deleteChiefComplaint = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const deletedChiefComplaint = await ChiefComplaints.findByIdAndDelete(id);

    if (!deletedChiefComplaint) {
        return next(new AppError("Chief complaint not found", 404));
    }

    res.status(204).json({
        status: "Success",
        data: null
    });
});
