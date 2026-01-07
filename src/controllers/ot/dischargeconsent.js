import catchAsync from "../../utils/catchAsync.js";
import AppError from "../../utils/AppError.js";
import APIFeatures from "../../utils/ApiFeatures.js";
import DischargeConsent from "../../models/ot/dischargeconsent.js";

// CREATE
export const createDischargeConsent = catchAsync(async (req, res, next) => {
    const data = {
        patientId: req.body.patientId,
        dischargeConsentData: JSON.parse(req.body.dischargeConsentData),
        dischargeConsentSheet: req.body.dischargeConsentSheet,
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

    const consent = await DischargeConsent.create(data);

    res.status(201).json({
        status: "success",
        message: "Discharge consent created successfully",
        data: { consent },
    });
});

// GET ALL
export const getAllDischargeConsents = catchAsync(async (req, res, next) => {
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

    const features = new APIFeatures(DischargeConsent.find(query), req.query)
        .sort()
        .limitFields()
        .paginate();

    const consents = await features.query;
    const totalRecords = await DischargeConsent.countDocuments(query);
    const totalPages = Math.ceil(totalRecords / limit);

    res.status(200).json({
        status: "success",
        totalPages,
        currentPage: page,
        results: consents.length,
        data: { consents },
    });
});

// GET ONE
export const getDischargeConsent = catchAsync(async (req, res, next) => {
    const consent = await DischargeConsent.findById(req.params.id);

    if (!consent) {
        return next(new AppError("No discharge consent found with that ID", 404));
    }

    res.status(200).json({
        status: "success",
        data: { consent },
    });
});

// UPDATE
export const updateDischargeConsent = catchAsync(async (req, res, next) => {
    const updatedData = {
        ...req.body,
        ...(req.body.dischargeConsentData && {
            dischargeConsentData: JSON.parse(req.body.dischargeConsentData),
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

    const consent = await DischargeConsent.findByIdAndUpdate(req.params.id, updatedData, {
        new: true,
        runValidators: true,
    });

    if (!consent) {
        return next(new AppError("No discharge consent found with that ID", 404));
    }

    res.status(200).json({
        status: "success",
        message: "Discharge consent updated successfully",
        data: { consent },
    });
});

// DELETE
export const deleteDischargeConsent = catchAsync(async (req, res, next) => {
    const consent = await DischargeConsent.findByIdAndDelete(req.params.id);

    if (!consent) {
        return next(new AppError("No discharge consent found with that ID", 404));
    }

    res.status(204).json({
        status: "success",
        message: "Discharge consent deleted successfully",
    });
});
