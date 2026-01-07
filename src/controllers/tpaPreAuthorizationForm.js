import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js";
import APIFeatures from "../utils/ApiFeatures.js";
import TPAPreAuthorizationForm from "../models/tpaPreAuthorizationForm.js";

// Create
export const createTPAPreAuthorizationForm = catchAsync(async (req, res, next) => {
    const { patientId } = req.body;

    if (!patientId) {
        return next(new AppError("Patient ID is required", 400));
    }

    const form = await TPAPreAuthorizationForm.create(req.body);

    res.status(201).json({
        status: "Success",
        data: { form },
    });
});

// Get All with Pagination
export const getAllTPAPreAuthorizationForms = catchAsync(async (req, res, next) => {
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const filter = {};

    if (req.query.patientId) {
        filter.patientId = req.query.patientId;
    }

    const features = new APIFeatures(TPAPreAuthorizationForm.find(filter).populate("patientId"), req.query)
        .limitFields()
        .sort()
        .paginate();

    const forms = await features.query;
    const totalRecords = await TPAPreAuthorizationForm.countDocuments(filter);
    const totalPages = Math.ceil(totalRecords / limit);

    res.status(200).json({
        status: "Success",
        totalPages,
        currentPage: page,
        result: forms.length,
        data: { forms },
    });
});

// Get by ID
export const getTPAPreAuthorizationFormById = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const form = await TPAPreAuthorizationForm.findById(id).populate("patientId");
    if (!form) {
        return next(new AppError("Form not found", 404));
    }

    res.status(200).json({
        status: "Success",
        data: { form },
    });
});

// Update
export const updateTPAPreAuthorizationForm = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const updatedForm = await TPAPreAuthorizationForm.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true,
    });

    if (!updatedForm) {
        return next(new AppError("Form not found", 404));
    }

    res.status(200).json({
        status: "Success",
        data: { updatedForm },
    });
});

// Delete
export const deleteTPAPreAuthorizationForm = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const deletedForm = await TPAPreAuthorizationForm.findByIdAndDelete(id);
    if (!deletedForm) {
        return next(new AppError("Form not found", 404));
    }

    res.status(204).json({
        status: "Success",
        data: null,
    });
});
