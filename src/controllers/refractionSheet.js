import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js";
import APIFeatures from "../utils/ApiFeatures.js";
import RefractionSheet from "../models/refractionSheet.js";

export const createRefractionSheet = catchAsync(async (req, res, next) => {
    const { patientId } = req.body;

    if (!patientId) {
        return next(new AppError("Patient ID is missing", 400));
    }
    if (req.files) {
        if (req.files.refractionSheet) {
            req.body.refractionSheet = req.files?.refractionSheet[0].filename;
        }
    }

    const refractionSheet = await RefractionSheet.create(req.body);

    res.status(201).json({
        status: "Success",
        data: { refractionSheet },
    });
});

export const getAllRefractionSheets = catchAsync(async (req, res, next) => {
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;

    const queryObj = {};
    if(req.query.patientId) {
        queryObj.patientId = req.query.patientId;
    }

    if (req.query.enteredDate) {
        const enteredDate = new Date(req.query.enteredDate);
        const nextDay = new Date(enteredDate);
        nextDay.setDate(nextDay.getDate() + 1);

        queryObj.enteredDate = {
            $gte: enteredDate,
            $lt: nextDay
        };
    }
    
    const features = new APIFeatures(RefractionSheet.find(queryObj), req.query)
        .limitFields()
        .sort()
        .paginate();

    const refractionSheets = await features.query;
    const totalRecords = await RefractionSheet.countDocuments(queryObj);
    const totalPages = Math.ceil(totalRecords / limit);

    res.status(200).json({
        status: "Success",
        totalPages,
        currentPage: page,
        result: refractionSheets.length,
        data: { refractionSheets },
    });
});


export const getRefractionSheetById = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const refractionSheet = await RefractionSheet.findById(id);
    if (!refractionSheet) {
        return next(new AppError("Refraction Sheet not found", 404));
    }

    res.status(200).json({
        status: "Success",
        data: { refractionSheet },
    });
});

// Update a RefractionSheet record
export const updateRefractionSheet = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    if (req.files) {
        if (req.files.refractionSheet) {
            req.body.refractionSheet = req.files?.refractionSheet[0].filename;
        }
    }
    const updatedRefractionSheet = await RefractionSheet.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true,
    });

    if (!updatedRefractionSheet) {
        return next(new AppError("Refraction Sheet not found", 404));
    }

    res.status(200).json({
        status: "Success",
        data: { updatedRefractionSheet },
    });
});

// Delete a RefractionSheet record
export const deleteRefractionSheet = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const deletedRefractionSheet = await RefractionSheet.findByIdAndDelete(id);
    if (!deletedRefractionSheet) {
        return next(new AppError("Refraction Sheet not found", 404));
    }

    res.status(204).json({
        status: "Success",
        data: null,
    });
});