import catchAsync from "../utils/catchAsync.js";
import AppError from '../utils/AppError.js';
import APIFeatures from "../utils/ApiFeatures.js";
import MedicalHistory from "../models/medicalHistory.js";


export const createMedicalHistory = catchAsync(async (req, res, next) => {
    const { patientId } = req.body;

    if (!patientId) {
        return next(new AppError("ID is MMissing", 404));
    }

    const MedicalHistorys = await MedicalHistory.create(req.body);

    res.status(200).json({
        status: "Success",
        data: {
            MedicalHistorys
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

    const features = new APIFeatures(MedicalHistory.find(filter).populate("doctorId"), req.query)
        .limitFields()
        .sort()
        .paginate();

    const MedicalHistorys = await features.query;

    const totalRecords = await MedicalHistory.countDocuments(filter);
    const totalPages = Math.ceil(totalRecords / limit);

    res.status(200).json({
        status: "Success",
        totalPages,
        currentPage: page,
        result: MedicalHistorys.length,
        data: { MedicalHistorys },
    });
});


export const getChiefComplaintById = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const MedicalHistorys = await MedicalHistory.findById(id);

    if (!MedicalHistorys) {
        return next(new AppError("Chief complaint not found", 404));
    }

    res.status(200).json({
        status: "Success",
        data: { MedicalHistorys },
    });
});

export const updateChiefComplaint = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const updatedMedicalHistory = await MedicalHistory.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true
    });

    if (!updatedMedicalHistory) {
        return next(new AppError("Chief complaint not found", 404));
    }

    res.status(200).json({
        status: "Success",
        data: { updatedMedicalHistory }
    });
});

export const deleteChiefComplaint = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const deletedmediaclHostory = await MedicalHistory.findByIdAndDelete(id);

    if (!deletedmediaclHostory) {
        return next(new AppError("Chief complaint not found", 404));
    }

    res.status(204).json({
        status: "Success",
        data: null
    });
});
