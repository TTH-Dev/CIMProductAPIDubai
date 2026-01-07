import catchAsync from "../../utils/catchAsync.js";
import AppError from "../../utils/AppError.js";
import APIFeatures from "../../utils/ApiFeatures.js";
import AdmissionForm from "../../models/ot/admissionForm.js";

export const createAdmissionForm = catchAsync(async (req, res, next) => {

    
    const data = {
        admissionFormData: JSON.parse(req.body.admissionFormData),
        admissionFormSheet: req.body.admissionFormSheet,
        patientId: req.body.patientId,
    };

    const admissionForm = await AdmissionForm.create(data);

    res.status(201).json({
        status: "success",
        message: "Admission form created successfully",
        data: { admissionForm },
    });
});

export const getAllAdmissionForms = catchAsync(async (req, res, next) => {
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

    const features = new APIFeatures(AdmissionForm.find(query), req.query)
        .sort()
        .limitFields()
        .paginate();

    const admissionForms = await features.query;
    const totalRecords = await AdmissionForm.countDocuments(query);
    const totalPages = Math.ceil(totalRecords / limit);

    res.status(200).json({
        status: "success",
        totalPages,
        currentPage: page,
        results: admissionForms.length,
        data: { admissionForms },
    });
});

export const getAdmissionForm = catchAsync(async (req, res, next) => {
    const admissionForm = await AdmissionForm.findById(req.params.id);

    if (!admissionForm) {
        return next(new AppError("No admission form found with that ID", 404));
    }

    res.status(200).json({
        status: "success",
        data: { admissionForm },
    });
});

export const updateAdmissionForm = catchAsync(async (req, res, next) => {
    const updatedData = {
        ...req.body,
        ...(req.body.admissionFormData && {
            admissionFormData: JSON.parse(req.body.admissionFormData),
        }),
    };

    const admissionForm = await AdmissionForm.findByIdAndUpdate(
        req.params.id,
        updatedData,
        {
            new: true,
            runValidators: true,
        }
    );

    if (!admissionForm) {
        return next(new AppError("No admission form found with that ID", 404));
    }

    res.status(200).json({
        status: "success",
        message: "Admission form updated successfully",
        data: { admissionForm },
    });
});

export const deleteAdmissionForm = catchAsync(async (req, res, next) => {
    const admissionForm = await AdmissionForm.findByIdAndDelete(req.params.id);

    if (!admissionForm) {
        return next(new AppError("No admission form found with that ID", 404));
    }

    res.status(204).json({
        status: "success",
        message: "Admission form deleted successfully",
    });
});
