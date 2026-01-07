import catchAsync from "../../utils/catchAsync.js";
import AppError from "../../utils/AppError.js";
import APIFeatures from "../../utils/ApiFeatures.js";
import AnestheticsAssessment from "../../models/ot/anestheticsAssessment.js";

export const createAnestheticsAssessment = catchAsync(async (req, res, next) => {

    const data = {
        patientId: req.body.patientId,
        anestheticsAssessmentData: JSON.parse(req.body.anestheticsAssessmentData),
        anestheticsAssessmentSheet: req.body.anestheticsAssessmentSheet,
    };

    if (req.files) {
        if (req.files.signatureDocument) {
            data.signatureDocument = req.files?.signatureDocument[0].filename;
        }
    }

    const assessment = await AnestheticsAssessment.create(data);

    res.status(201).json({
        status: "success",
        message: "Anesthetics assessment created successfully",
        data: { assessment },
    });
});

export const getAllAnestheticsAssessments = catchAsync(async (req, res, next) => {
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

    const features = new APIFeatures(AnestheticsAssessment.find(query), req.query)
        .sort()
        .limitFields()
        .paginate();

    const assessments = await features.query;
    const totalRecords = await AnestheticsAssessment.countDocuments(query);
    const totalPages = Math.ceil(totalRecords / limit);

    res.status(200).json({
        status: "success",
        totalPages,
        currentPage: page,
        results: assessments.length,
        data: { assessments },
    });
});

// GET ONE
export const getAnestheticsAssessment = catchAsync(async (req, res, next) => {
    const assessment = await AnestheticsAssessment.findById(req.params.id);

    if (!assessment) {
        return next(new AppError("No anesthetics assessment found with that ID", 404));
    }

    res.status(200).json({
        status: "success",
        data: { assessment },
    });
});

// UPDATE
export const updateAnestheticsAssessment = catchAsync(async (req, res, next) => {
    const updatedData = {
        ...req.body,
        ...(req.body.anestheticsAssessmentData && {
            anestheticsAssessmentData: JSON.parse(req.body.anestheticsAssessmentData),
        }),
    };

    const assessment = await AnestheticsAssessment.findByIdAndUpdate(
        req.params.id,
        updatedData,
        {
            new: true,
            runValidators: true,
        }
    );

    if (!assessment) {
        return next(new AppError("No anesthetics assessment found with that ID", 404));
    }

    res.status(200).json({
        status: "success",
        message: "Anesthetics assessment updated successfully",
        data: { assessment },
    });
});

// DELETE
export const deleteAnestheticsAssessment = catchAsync(async (req, res, next) => {
    const assessment = await AnestheticsAssessment.findByIdAndDelete(req.params.id);

    if (!assessment) {
        return next(new AppError("No anesthetics assessment found with that ID", 404));
    }

    res.status(204).json({
        status: "success",
        message: "Anesthetics assessment deleted successfully",
    });
});
