import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js";
import APIFeatures from "../utils/ApiFeatures.js";
import Notes from "../models/notes.js";

export const createNotes = catchAsync(async (req, res, next) => {

    const notes = await Notes.create(req.body);
    
    res.status(201).json({
        status: "success",
        message: "Notes created successfully",
        data: { notes },
    });
});

export const getAllNotess = catchAsync(async (req, res, next) => {
    const { createdAt } = req.query;
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    let query = {};

    if (createdAt) {
        const date = new Date(createdAt);
        const nextDay = new Date(date);
        nextDay.setDate(date.getDate() + 1);
        query.createdAt = { $gte: date, $lt: nextDay };
    }
    if (req.query.patientId) {
        query.patientId = req.query.patientId;
    }
    const features = new APIFeatures(Notes.find(query), req.query)
        .sort()
        .limitFields()
        .paginate();

    const notess = await features.query;
    const totalRecords = await ChiefComplaints.countDocuments(filter);
    const totalPages = Math.ceil(totalRecords / limit);

    res.status(200).json({
        status: "success",
        results: notess.length,
        totalPages,
        currentPage: page,
        data: { notess },
    });
});

export const getNotes = catchAsync(async (req, res, next) => {
  

    const notes = await Notes.find();

    if (!notes || notes.length === 0) {
        return next(new AppError("No notes records found for the given date", 404));
    }

    res.status(200).json({
        status: "success",
        results: notes.length,
        data: { notes },
    });
});


export const updateNotes = catchAsync(async (req, res, next) => {
    const notes = await Notes.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    });

    if (!notes) {
        return next(new AppError("No notes found with that ID", 404));
    }

    res.status(200).json({
        status: "success",
        message: "Notes updated successfully",
        data: { notes },
    });
});

export const deleteNotes = catchAsync(async (req, res, next) => {
    const notes = await Notes.findByIdAndDelete(req.params.id);
    if (!notes) {
        return next(new AppError("No notes found with that ID", 404));
    }

    res.status(204).json({
        status: "success",
        message: "Notes deleted successfully",
    });
});


