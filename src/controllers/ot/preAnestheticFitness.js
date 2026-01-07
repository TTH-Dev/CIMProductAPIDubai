import catchAsync from "../../utils/catchAsync.js";
import AppError from "../../utils/AppError.js";
import APIFeatures from "../../utils/ApiFeatures.js";
import PreAnestheticFitness from "../../models/ot/preAnestheticFitness.js";

export const createPreAnestheticFitness = catchAsync(async (req, res, next) => {
    const data = {
        patientId: req.body.patientId,
        preAnestheticFitnessData: JSON.parse(req.body.preAnestheticFitnessData),
        preAnestheticFitnessSheet: req.body.preAnestheticFitnessSheet,
    };

    const fitness = await PreAnestheticFitness.create(data);

    res.status(201).json({
        status: "success",
        message: "Pre-anesthetic fitness created successfully",
        data: { fitness },
    });
});

export const getAllPreAnestheticFitness = catchAsync(async (req, res, next) => {
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

    const features = new APIFeatures(PreAnestheticFitness.find(query), req.query)
        .sort()
        .limitFields()
        .paginate();

    const fitnessEntries = await features.query;
    const totalRecords = await PreAnestheticFitness.countDocuments(query);
    const totalPages = Math.ceil(totalRecords / limit);

    res.status(200).json({
        status: "success",
        totalPages,
        currentPage: page,
        results: fitnessEntries.length,
        data: { fitnessEntries },
    });
});

// GET ONE
export const getPreAnestheticFitness = catchAsync(async (req, res, next) => {
    const fitness = await PreAnestheticFitness.findById(req.params.id);

    if (!fitness) {
        return next(new AppError("No pre-anesthetic fitness found with that ID", 404));
    }

    res.status(200).json({
        status: "success",
        data: { fitness },
    });
});

// UPDATE
export const updatePreAnestheticFitness = catchAsync(async (req, res, next) => {
    const updatedData = {
        ...req.body,
        ...(req.body.preAnestheticFitnessData && {
            preAnestheticFitnessData: JSON.parse(req.body.preAnestheticFitnessData),
        }),
    };

    const fitness = await PreAnestheticFitness.findByIdAndUpdate(
        req.params.id,
        updatedData,
        {
            new: true,
            runValidators: true,
        }
    );

    if (!fitness) {
        return next(new AppError("No pre-anesthetic fitness found with that ID", 404));
    }

    res.status(200).json({
        status: "success",
        message: "Pre-anesthetic fitness updated successfully",
        data: { fitness },
    });
});

// DELETE
export const deletePreAnestheticFitness = catchAsync(async (req, res, next) => {
    const fitness = await PreAnestheticFitness.findByIdAndDelete(req.params.id);

    if (!fitness) {
        return next(new AppError("No pre-anesthetic fitness found with that ID", 404));
    }

    res.status(204).json({
        status: "success",
        message: "Pre-anesthetic fitness deleted successfully",
    });
});
