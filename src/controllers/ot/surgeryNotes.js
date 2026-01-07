import catchAsync from "../../utils/catchAsync.js";
import AppError from "../../utils/AppError.js";
import APIFeatures from "../../utils/ApiFeatures.js";
import SurgeryNotes from "../../models/ot/surgeryNotes.js";

// CREATE
export const createSurgeryNotes = catchAsync(async (req, res, next) => {
    const data = {
        patientId: req.body.patientId,
        surgeryNotesData: JSON.parse(req.body.surgeryNotesData),
        surgeryNotesSheet: req.body.surgeryNotesSheet,
    };
        
    if (req.files) {
        if (req.files.signatureDocument) {
            data.signatureDocument = req.files?.signatureDocument[0].filename;
        }
    }

    const notes = await SurgeryNotes.create(data);

    res.status(201).json({
        status: "success",
        message: "Surgery notes created successfully",
        data: { notes },
    });
});

// GET ALL
export const getAllSurgeryNotes = catchAsync(async (req, res, next) => {
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const { createdAt, patientId,valueType } = req.query;

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

        if (valueType) {
        query.valueType = valueType;
    }

    const features = new APIFeatures(SurgeryNotes.find(query).populate("patientId"), req.query)
        .sort()
        .limitFields()
        .paginate();

    const notes = await features.query;
    const totalRecords = await SurgeryNotes.countDocuments(query);
    const totalPages = Math.ceil(totalRecords / limit);

    res.status(200).json({
        status: "success",
        totalPages,
        currentPage: page,
        results: notes.length,
        data: { notes },
    });
});

// GET ONE
export const getSurgeryNotes = catchAsync(async (req, res, next) => {
    const notes = await SurgeryNotes.findById(req.params.id);

    if (!notes) {
        return next(new AppError("No surgery notes found with that ID", 404));
    }

    res.status(200).json({
        status: "success",
        data: { notes },
    });
});

// UPDATE
export const updateSurgeryNotes = catchAsync(async (req, res, next) => {
    const updatedData = {
        ...req.body,
        ...(req.body.surgeryNotesData && {
            surgeryNotesData: JSON.parse(req.body.surgeryNotesData),
        }),
    };

    const notes = await SurgeryNotes.findByIdAndUpdate(req.params.id, updatedData, {
        new: true,
        runValidators: true,
    });

    if (!notes) {
        return next(new AppError("No surgery notes found with that ID", 404));
    }

    res.status(200).json({
        status: "success",
        message: "Surgery notes updated successfully",
        data: { notes },
    });
});

// DELETE
export const deleteSurgeryNotes = catchAsync(async (req, res, next) => {
    const notes = await SurgeryNotes.findByIdAndDelete(req.params.id);

    if (!notes) {
        return next(new AppError("No surgery notes found with that ID", 404));
    }

    res.status(204).json({
        status: "success",
        message: "Surgery notes deleted successfully",
    });
});
