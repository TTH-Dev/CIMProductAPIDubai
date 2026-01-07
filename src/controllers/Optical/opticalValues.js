import catchAsync from "../../utils/catchAsync.js";
import AppError from "../../utils/AppError.js";
import APIFeatures from "../../utils/ApiFeatures.js";
import OpticalValues from "../../models/Optical/opticalValues.js";

export const createOpticalValues = catchAsync(async (req, res, next) => {

    const opticalValues = await OpticalValues.create(req.body);

    res.status(200).json({
        status: "Success",
        data: {
            opticalValues
        },
    })
});

export const getAllOpticalValues = catchAsync(async (req, res, next) => {
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

    const features = new APIFeatures(OpticalValues.find(filter), req.query)
        .limitFields()
        .sort()
        .paginate();

    const opticalValues = await features.query;
    const totalRecords = await OpticalValues.countDocuments(filter);
    const totalPages = Math.ceil(totalRecords / limit);

    res.status(200).json({
        status: "Success",
        totalPages,
        currentPage: page,
        result: opticalValues.length,
        data: { opticalValues },
    });
});

export const getOpticalValuesById = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const opticalValues = await OpticalValues.findById(id);
    if (!opticalValues) {
        return next(new AppError(" OpticalValues not found", 404));
    }

    res.status(200).json({
        status: "Success",
        data: { opticalValues },
    });
});

export const updateOpticalValues = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const opticalValues = await OpticalValues.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true,
    });

    if (!opticalValues) {
        return next(new AppError(" OpticalValues not found", 404));
    }

    res.status(200).json({
        status: "Success",
        data: { opticalValues },
    });
});

export const deleteOpticalValues = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const opticalValues = await OpticalValues.findByIdAndDelete(id);
    if (!opticalValues) {
        return next(new AppError(" OpticalValues not found", 404));
    }

    res.status(204).json({
        status: "Success",
        data: null,
    });
});




