import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js";
import APIFeatures from "../utils/ApiFeatures.js";
import IPAdmission from "../models/IPAdmission.js";

export const createIPAdmission = catchAsync(async (req, res, next) => {
    const { patientId } = req.body;

    if (!patientId) {
        return next(new AppError("Patient ID is missing", 404));
    }

    const ipAdmission = await IPAdmission.create(req.body);

    res.status(200).json({
        status: "Success",
        data: { ipAdmission },
    });
});

export const getAllIPAdmissions = catchAsync(async (req, res, next) => {
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
    const features = new APIFeatures(IPAdmission.find(filter), req.query)
        .limitFields()
        .sort()
        .paginate();

    const ipAdmissions = await features.query;
    const totalRecords = await IPAdmission.countDocuments(filter);
    const totalPages = Math.ceil(totalRecords / limit);

    res.status(200).json({
        status: "Success",
        totalPages,
        currentPage: page,
        result: ipAdmissions.length,
        data: { ipAdmissions },
    });
});
