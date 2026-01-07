import catchAsync from "../../utils/catchAsync.js";
import AppError from "../../utils/AppError.js";
import APIFeatures from "../../utils/ApiFeatures.js";
import SurgicalSafetyCheckLists from "../../models/ot/surgicalSafetyChecklits.js";

export const createSurgicalSafetyCheckList = catchAsync(async (req, res, next) => {

    const data = {
        patientId: req.body.patientId,
        surgicalSafetyCheckLitsData: JSON.parse(req.body.surgicalSafetyCheckLitsData),
        surgicalSafetyCheckLitsSheet: req.body.surgicalSafetyCheckLitsSheet,
    };

    if (req.files) {
        if (req.files.surgeonSignatureDocument) {
            data.surgeonSignatureDocument = req.files?.surgeonSignatureDocument[0].filename;
        }
        if (req.files.anesthetistsSignatureDocument) {
            data.anesthetistsSignatureDocument = req.files?.anesthetistsSignatureDocument[0].filename;
        }
        if (req.files.nursingStaffSignatureDocument) {
            data.nursingStaffSignatureDocument = req.files?.nursingStaffSignatureDocument[0].filename;
        }
    }

    const checkList = await SurgicalSafetyCheckLists.create(data);

    res.status(201).json({
        status: "success",
        message: "Surgical safety checklist created successfully",
        data: { checkList },
    });
});

export const getAllSurgicalSafetyCheckLists = catchAsync(async (req, res, next) => {
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

    const features = new APIFeatures(SurgicalSafetyCheckLists.find(query), req.query)
        .sort()
        .limitFields()
        .paginate();

    const checkLists = await features.query;
    const totalRecords = await SurgicalSafetyCheckLists.countDocuments(query);
    const totalPages = Math.ceil(totalRecords / limit);

    res.status(200).json({
        status: "success",
        totalPages,
        currentPage: page,
        results: checkLists.length,
        data: { checkLists },
    });
});

export const getSurgicalSafetyCheckList = catchAsync(async (req, res, next) => {
    const checkList = await SurgicalSafetyCheckLists.findById(req.params.id);

    if (!checkList) {
        return next(new AppError("No surgical safety checklist found with that ID", 404));
    }

    res.status(200).json({
        status: "success",
        data: { checkList },
    });
});

export const updateSurgicalSafetyCheckList = catchAsync(async (req, res, next) => {
    const updatedData = {
        ...req.body,
        ...(req.body.surgicalSafetyCheckLitsData && {
            surgicalSafetyCheckLitsData: JSON.parse(req.body.surgicalSafetyCheckLitsData),
        }),
    };

    const checkList = await SurgicalSafetyCheckLists.findByIdAndUpdate(req.params.id, updatedData, {
        new: true,
        runValidators: true,
    });

    if (!checkList) {
        return next(new AppError("No surgical safety checklist found with that ID", 404));
    }

    res.status(200).json({
        status: "success",
        message: "Surgical safety checklist updated successfully",
        data: { checkList },
    });
});

export const deleteSurgicalSafetyCheckList = catchAsync(async (req, res, next) => {
    const checkList = await SurgicalSafetyCheckLists.findByIdAndDelete(req.params.id);

    if (!checkList) {
        return next(new AppError("No surgical safety checklist found with that ID", 404));
    }

    res.status(204).json({
        status: "success",
        message: "Surgical safety checklist deleted successfully",
    });
});
