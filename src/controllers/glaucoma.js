import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js";
import APIFeatures from "../utils/ApiFeatures.js";
import Glaucoma from "../models/glaucoma.js";

export const createGlaucoma = catchAsync(async (req, res, next) => {
    const { patientId } = req.body;

    if (!patientId) {
        return next(new AppError("Patient ID is missing", 400));
    }
    if (req.files) {
        if (req.files.signatureDocument) {
            req.body.signatureDocument = req.files?.signatureDocument[0].filename;
        }
    }
    const data = {
        glaucomaData: JSON.parse(req.body.glaucomaData),
        glaucomaWorkSheet: req.body.glaucomaWorkSheet,
        patientId: req.body.patientId,
      };

    const glaucoma = await Glaucoma.create(data);

    res.status(201).json({
        status: "Success",
        data: { glaucoma },
    });
});

export const getAllGlaucomas = catchAsync(async (req, res, next) => {
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
        query.patientId = req.query.patientId;
    }
    const features = new APIFeatures(Glaucoma.find(query), req.query)
        .limitFields()
        .sort()
        .paginate();

    const glaucomas = await features.query;
    const totalRecords = await Glaucoma.countDocuments(query);
    const totalPages = Math.ceil(totalRecords / limit);

    res.status(200).json({
        status: "Success",
        totalPages,
        currentPage: page,
        result: glaucomas.length,
        data: { glaucomas },
    });
});

export const getGlaucomaById = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const glaucoma = await Glaucoma.findById(id);
    if (!glaucoma) {
        return next(new AppError("Refraction Sheet not found", 404));
    }

    res.status(200).json({
        status: "Success",
        data: { glaucoma },
    });
});

export const updateGlaucoma = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    if (req.files) {
        if (req.files.signatureDocument) {
            req.body.signatureDocument = req.files?.signatureDocument[0].filename;
        }
    }
    const updatedGlaucoma = await Glaucoma.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true,
    });

    if (!updatedGlaucoma) {
        return next(new AppError("Refraction Sheet not found", 404));
    }

    res.status(200).json({
        status: "Success",
        data: { updatedGlaucoma },
    });
});

export const deleteGlaucoma = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const deletedGlaucoma = await Glaucoma.findByIdAndDelete(id);
    if (!deletedGlaucoma) {
        return next(new AppError("Refraction Sheet not found", 404));
    }

    res.status(204).json({
        status: "Success",
        data: null,
    });
});