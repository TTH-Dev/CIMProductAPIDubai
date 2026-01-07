import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js";
import APIFeatures from "../utils/ApiFeatures.js";
import AssociatedComplaint from "../models/associatedComplaints.js";

export const createAssociatedComplaint = catchAsync(async (req, res, next) => {
    const { patientId } = req.body;

    if (!patientId) {
        return next(new AppError("Patient ID is missing", 404));
    }

    const associatedComplaint = await AssociatedComplaint.create(req.body);

    res.status(200).json({
        status: "Success",
        data: { associatedComplaint },
    });
});

export const getAllAssociatedComplaints = catchAsync(async (req, res, next) => {
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

    const features = new APIFeatures(AssociatedComplaint.find(filter), req.query)
        .limitFields()
        .sort()
        .paginate();

    const associatedComplaints = await features.query;
    const totalRecords = await AssociatedComplaint.countDocuments(filter);
    const totalPages = Math.ceil(totalRecords / limit);

    res.status(200).json({
        status: "Success",
        totalPages,
        currentPage: page,
        result: associatedComplaints.length,
        data: { associatedComplaints },
    });
});

export const getAssociatedComplaintById = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const associatedComplaint = await AssociatedComplaint.findById(id);
    if (!associatedComplaint) {
        return next(new AppError("Associated Complaint not found", 404));
    }

    res.status(200).json({
        status: "Success",
        data: { associatedComplaint },
    });
});

export const updateAssociatedComplaint = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const updatedComplaint = await AssociatedComplaint.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true,
    });

    if (!updatedComplaint) {
        return next(new AppError("Associated Complaint not found", 404));
    }

    res.status(200).json({
        status: "Success",
        data: { updatedComplaint },
    });
});

export const deleteAssociatedComplaint = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const deletedComplaint = await AssociatedComplaint.findByIdAndDelete(id);
    if (!deletedComplaint) {
        return next(new AppError("Associated Complaint not found", 404));
    }

    res.status(204).json({
        status: "Success",
        data: null,
    });
});
