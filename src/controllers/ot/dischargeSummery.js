import catchAsync from "../../utils/catchAsync.js";
import AppError from "../../utils/AppError.js";
import APIFeatures from "../../utils/ApiFeatures.js";
import DischargeSummery from "../../models/ot/dischargeSummery.js";

// CREATE
export const createDischargeSummery = catchAsync(async (req, res, next) => {

    const data = {
        patientId: req.body.patientId,
        dischargeSummeryData: JSON.parse(req.body.dischargeSummeryData),
        dischargeSummerySheet: req.body.dischargeSummerySheet,
    };

    if (req.files) {
        if (req.files.DoctorSignature) {
            data.DoctorSignature = req.files?.DoctorSignature[0].filename;
        }
        if (req.files.PatientSignature) {
            data.PatientSignature = req.files?.PatientSignature[0].filename;
        }
        if (req.files.GuardianSignature) {
            data.GuardianSignature = req.files?.GuardianSignature[0].filename;
        }
                if (req.files.WitnessSignature) {
            data.WitnessSignature = req.files?.WitnessSignature[0].filename;
        }
    }

    const summery = await DischargeSummery.create(data);

    res.status(201).json({
        status: "success",
        message: "Discharge summery created successfully",
        data: { summery },
    });
});

// GET ALL
export const getAllDischargeSummeries = catchAsync(async (req, res, next) => {
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
        query.patientId = patientId;
    }

    const features = new APIFeatures(DischargeSummery.find(query), req.query)
        .sort()
        .limitFields()
        .paginate();

    const summeries = await features.query;
    const totalRecords = await DischargeSummery.countDocuments(query);
    const totalPages = Math.ceil(totalRecords / limit);

    res.status(200).json({
        status: "success",
        totalPages,
        currentPage: page,
        results: summeries.length,
        data: { summeries },
    });
});

// GET ONE
export const getDischargeSummery = catchAsync(async (req, res, next) => {
    const summery = await DischargeSummery.findById(req.params.id);

    if (!summery) {
        return next(new AppError("No discharge summery found with that ID", 404));
    }

    res.status(200).json({
        status: "success",
        data: { summery },
    });
});

// UPDATE
export const updateDischargeSummery = catchAsync(async (req, res, next) => {
    const updatedData = {
        ...req.body,
        ...(req.body.dischargeSummeryData && {
            dischargeSummeryData: JSON.parse(req.body.dischargeSummeryData),
        }),
    };

        if (req.files) {
        if (req.files.DoctorSignature) {
            updatedData.DoctorSignature = req.files?.DoctorSignature[0].filename;
        }
        if (req.files.PatientSignature) {
            updatedData.PatientSignature = req.files?.PatientSignature[0].filename;
        }
        if (req.files.GuardianSignature) {
            updatedData.GuardianSignature = req.files?.GuardianSignature[0].filename;
        }
                if (req.files.WitnessSignature) {
            updatedData.WitnessSignature = req.files?.WitnessSignature[0].filename;
        }
    }

    const summery = await DischargeSummery.findByIdAndUpdate(req.params.id, updatedData, {
        new: true,
        runValidators: true,
    });

    if (!summery) {
        return next(new AppError("No discharge summery found with that ID", 404));
    }

    res.status(200).json({
        status: "success",
        message: "Discharge summery updated successfully",
        data: { summery },
    });
});

// DELETE
export const deleteDischargeSummery = catchAsync(async (req, res, next) => {
    const summery = await DischargeSummery.findByIdAndDelete(req.params.id);

    if (!summery) {
        return next(new AppError("No discharge summery found with that ID", 404));
    }

    res.status(204).json({
        status: "success",
        message: "Discharge summery deleted successfully",
    });
});
