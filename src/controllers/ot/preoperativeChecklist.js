import catchAsync from "../../utils/catchAsync.js";
import AppError from "../../utils/AppError.js";
import APIFeatures from "../../utils/ApiFeatures.js";
import PreOperativeChecklist from "../../models/ot/preoperativeChecklist.js";

// CREATE
export const createPreOperativeChecklist = catchAsync(async (req, res, next) => {
    const data = {
        patientId: req.body.patientId,
        preOperativeChecklistData: JSON.parse(req.body.preOperativeChecklistData),
    };

    
    if (req.files) {
        if (req.files.signatureDocument) {
            data.signatureDocument = req.files?.signatureDocument[0].filename;
        }
    }


    const checklist = await PreOperativeChecklist.create(data);

    res.status(201).json({
        status: "success",
        message: "Pre-operative checklist created successfully",
        data: { checklist },
    });
});

// GET ALL
export const getAllPreOperativeChecklists = catchAsync(async (req, res, next) => {
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

    const features = new APIFeatures(PreOperativeChecklist.find(query), req.query)
        .sort()
        .limitFields()
        .paginate();

    const checklists = await features.query;
    const totalRecords = await PreOperativeChecklist.countDocuments(query);
    const totalPages = Math.ceil(totalRecords / limit);

    res.status(200).json({
        status: "success",
        totalPages,
        currentPage: page,
        results: checklists.length,
        data: { checklists },
    });
});

// GET ONE
export const getPreOperativeChecklist = catchAsync(async (req, res, next) => {
    const checklist = await PreOperativeChecklist.findById(req.params.id);

    if (!checklist) {
        return next(new AppError("No pre-operative checklist found with that ID", 404));
    }

    res.status(200).json({
        status: "success",
        data: { checklist },
    });
});

// UPDATE
export const updatePreOperativeChecklist = catchAsync(async (req, res, next) => {
    const updatedData = {
        ...req.body,
        ...(req.body.preOperativeChecklistData && {
            preOperativeChecklistData: JSON.parse(req.body.preOperativeChecklistData),
        }),
    };

    const checklist = await PreOperativeChecklist.findByIdAndUpdate(req.params.id, updatedData, {
        new: true,
        runValidators: true,
    });

    if (!checklist) {
        return next(new AppError("No pre-operative checklist found with that ID", 404));
    }

    res.status(200).json({
        status: "success",
        message: "Pre-operative checklist updated successfully",
        data: { checklist },
    });
});

// DELETE
export const deletePreOperativeChecklist = catchAsync(async (req, res, next) => {
    const checklist = await PreOperativeChecklist.findByIdAndDelete(req.params.id);

    if (!checklist) {
        return next(new AppError("No pre-operative checklist found with that ID", 404));
    }

    res.status(204).json({
        status: "success",
        message: "Pre-operative checklist deleted successfully",
    });
});
