import catchAsync from "../../utils/catchAsync.js";
import AppError from "../../utils/AppError.js";
import APIFeatures from "../../utils/ApiFeatures.js";
import AnestheticsNotes from "../../models/ot/anesthetistNotes.js";

export const createAnestheticsNotes = catchAsync(async (req, res, next) => {
    const data = {
        patientId: req.body.patientId,
        anestheticsNotesData: JSON.parse(req.body.anestheticsNotesData),
        anestheticsNotesSheet: req.body.anestheticsNotesSheet,
    };

    if (req.files) {
        if (req.files.signatureDocument) {
            data.signatureDocument = req.files?.signatureDocument[0].filename;
        }
    }

    const notes = await AnestheticsNotes.create(data);

    res.status(201).json({
        status: "success",
        message: "Anesthetics notes created successfully",
        data: { notes },
    });
});

export const getAllAnestheticsNotes = catchAsync(async (req, res, next) => {
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

    const features = new APIFeatures(AnestheticsNotes.find(query), req.query)
        .sort()
        .limitFields()
        .paginate();

    const notes = await features.query;
    const totalRecords = await AnestheticsNotes.countDocuments(query);
    const totalPages = Math.ceil(totalRecords / limit);

    res.status(200).json({
        status: "success",
        totalPages,
        currentPage: page,
        results: notes.length,
        data: { notes },
    });
});

export const getAnestheticsNotes = catchAsync(async (req, res, next) => {
    const notes = await AnestheticsNotes.findById(req.params.id);

    if (!notes) {
        return next(new AppError("No anesthetics notes found with that ID", 404));
    }

    res.status(200).json({
        status: "success",
        data: { notes },
    });
});

export const updateAnestheticsNotes = catchAsync(async (req, res, next) => {
    const updatedData = {
        ...req.body,
        ...(req.body.anestheticsNotesData && {
            anestheticsNotesData: JSON.parse(req.body.anestheticsNotesData),
        }),
    };

    const notes = await AnestheticsNotes.findByIdAndUpdate(
        req.params.id,
        updatedData,
        {
            new: true,
            runValidators: true,
        }
    );

    if (!notes) {
        return next(new AppError("No anesthetics notes found with that ID", 404));
    }

    res.status(200).json({
        status: "success",
        message: "Anesthetics notes updated successfully",
        data: { notes },
    });
});

export const deleteAnestheticsNotes = catchAsync(async (req, res, next) => {
    const notes = await AnestheticsNotes.findByIdAndDelete(req.params.id);

    if (!notes) {
        return next(new AppError("No anesthetics notes found with that ID", 404));
    }

    res.status(204).json({
        status: "success",
        message: "Anesthetics notes deleted successfully",
    });
});
